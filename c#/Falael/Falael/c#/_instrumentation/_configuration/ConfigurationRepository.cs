using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Encodings.Web;
using System.Diagnostics;
using System.Collections;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Falael
{
	public class ConfigurationRepository
	{
		public ConfigurationRepository()
		{
		}


		#region Nested Types

		public class JsRegexConverter : JsonConverter<Regex>
		{
			public override Regex Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
			{
				if (reader.TokenType != JsonTokenType.String)
				{
					throw new JsonException("Expected string value for Regex.");
				}
				string? jsRegex = reader.GetString();
				if (jsRegex == null) return new Regex("");

				// Parse JS-style regex
				var lastSlash = jsRegex.LastIndexOf('/');
				if (lastSlash <= 0) throw new JsonException("Invalid JS-style regex format.");

				var pattern = jsRegex[1..lastSlash];
				var flagsString = jsRegex[(lastSlash + 1)..];

				RegexOptions regexOptions = RegexOptions.None;
				if (flagsString.Contains('i')) regexOptions |= RegexOptions.IgnoreCase;
				if (flagsString.Contains('m')) regexOptions |= RegexOptions.Multiline;

				return new Regex(pattern, regexOptions);
			}

			public override void Write(Utf8JsonWriter writer, Regex value, JsonSerializerOptions options)
			{
				string pattern = value.ToString();
				string flags = "";

				if ((value.Options & RegexOptions.IgnoreCase) != 0) flags += "i";
				if ((value.Options & RegexOptions.Multiline) != 0) flags += "m";

				writer.WriteStringValue($"/{pattern}/{flags}");
			}
		}

		#endregion

		//	does not parse strings; this is done by `Configuration.ApplyProperty` (`DateTime`, `TimeSpan` etc. are present as strings at this point)
		public ConfigurationRepository CascadeJSON(string json)
		{
			var jsonSerializerOptions = new JsonSerializerOptions
			{
				AllowTrailingCommas = true,
				ReadCommentHandling = JsonCommentHandling.Skip,
			};
			jsonSerializerOptions.Converters.Add(new JsRegexConverter());
			_processJsonElement(JsonSerializer.Deserialize<JsonElement>(json, jsonSerializerOptions), string.Empty);

			return this;

			void _processJsonElement(JsonElement element, string path)
			{
				switch (element.ValueKind)
				{
					case JsonValueKind.Object:
						foreach (var property in element.EnumerateObject())
						{
							string newPath = string.IsNullOrEmpty(path) ? property.Name : $"{path}.{property.Name}";
							_processJsonElement(property.Value, newPath);
						}
						break;

					case JsonValueKind.Array:
						this.graphCursors[path] = JsonSerializer.Deserialize<List<object>>(element.GetRawText(), jsonSerializerOptions);
						break;

					case JsonValueKind.String:
						this.graphCursors[path] = element.GetString() ?? string.Empty;
						break;

					case JsonValueKind.Number:
						if (element.TryGetInt64(out long longValue)) this.graphCursors[path] = longValue;
						else this.graphCursors[path] = element.GetDouble();
						break;

					case JsonValueKind.True:
					case JsonValueKind.False:
						this.graphCursors[path] = element.GetBoolean();
						break;

					case JsonValueKind.Null:
						this.graphCursors[path] = null;
						break;
				}
			}
		}

		//	does not stringify non-json types (allows for `DateTime`, `TimeSpan` etc. as values); this is done by `this.ToJSON()`
		public ConfigurationRepository CascadeConfiguration(object configuration)
		{
			var ct = configuration.GetType();
			var cca = ct.GetCustomAttribute(typeof(ConfigurationClassAttribute), true) as ConfigurationClassAttribute ?? throw new ArgumentException($"{ct.FullName} must have the {nameof(ConfigurationClassAttribute)}.");
			if (cca != null && cca.Nested) throw new ArgumentException($"{ct.FullName} cannot have {nameof(ConfigurationClassAttribute)}.{nameof(ConfigurationClassAttribute.Nested)} == true.");

			_processConfiguration(configuration);

			return this;

			void _processConfiguration(object configuration, string? basePath = null)
			{
				var properties = configuration.GetType().GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
				var configurableProperties = properties.Where(prop => prop.GetCustomAttribute<ConfigurationFieldAttribute>() != null);

				foreach (var prop in configurableProperties)
				{
					var attr = prop.GetCustomAttribute<ConfigurationFieldAttribute>();
					Debug.Assert(attr != null);

					var fullPath = basePath == null ? attr.JsonPath : $"{basePath}.{attr.JsonPath}";
					var value = prop.GetValue(configuration);

					var ct = value?.GetType();
					var cca = ct?.GetCustomAttribute(typeof(ConfigurationClassAttribute), true) as ConfigurationClassAttribute;
					if (cca != null && !cca.Nested) throw new ArgumentException($"{ct?.FullName} cannot have {nameof(ConfigurationClassAttribute)}.{nameof(ConfigurationClassAttribute.Nested)} == false.");

					if (value != null && cca != null) _processConfiguration(value, fullPath);
					else this.graphCursors[fullPath] = value;
				}
			}
		}

		public ConfigurationRepository CascadeDictionary(Dictionary<string, object?> dictionary)
		{
			foreach (var kvp in dictionary) this.graphCursors[kvp.Key] = kvp.Value;

			return this;
		}

		public ConfigurationRepository CascadeDefaultConfiguration(string assemblyNamePrefix)
		{
			IEnumerable<Type> configurationClasses = AppDomain.CurrentDomain.GetAssemblies()
				.Where(assembly =>
				{
					var assemblyName = assembly.GetName().Name;
					return assemblyName != null && assemblyName.StartsWith(assemblyNamePrefix, StringComparison.OrdinalIgnoreCase);
				})
				.SelectMany(assembly =>
				{
					try
					{
						return assembly.GetTypes().Where(t => t != null);
					}
					catch (ReflectionTypeLoadException ex)
					{
						Debug.WriteLine(ex);
						return ex.Types.Where(t => t != null);
					}
				})
				.Cast<Type>()
				.Where(type =>
				{
					try
					{
						return type!.GetCustomAttribute(typeof(ConfigurationClassAttribute), true) is ConfigurationClassAttribute cca && !cca.Nested;
					}
					catch (Exception ex)
					{
						Debug.WriteLine(ex);
						return false;
					}
				});

			configurationClasses = configurationClasses.OrderBy(v => v.Name);

			foreach (var configurationClass in configurationClasses) this.CascadeConfiguration(Activator.CreateInstance(configurationClass) ?? throw new InvalidOperationException($"{configurationClass.FullName} has no default constructor."));

			return this;
		}

		public ConfigurationRepository ExpandAliases()
		{
			var regex = new Regex(@"\{\{(.*?)\}\}");
			var processedKeys = new HashSet<string>();

			foreach (var key in this.graphCursors.Keys) _expandAliases(key, regex, processedKeys, []);

			return this;

			void _expandAliases(string key, Regex regex, HashSet<string> processedKeys, HashSet<string> stack)
			{
				if (processedKeys.Contains(key)) return;
				if (stack.Contains(key)) throw new FormatException($"Cyclic reference detected for key: {key}");

				stack.Add(key);
				if (this.graphCursors[key] is string value)
				{
					bool replaced;
					do
					{
						replaced = false;
						value = regex.Replace(value, match =>
						{
							var placeholderKey = match.Groups[1].Value;
							if (this.graphCursors.TryGetValue(placeholderKey, out var placeholderValue))
							{
								replaced = true;
								_expandAliases(placeholderKey, regex, processedKeys, stack);
								return this.graphCursors[placeholderKey]?.ToString() ?? string.Empty;
							}
							return match.Value; // Keep unmatched placeholders intact
						});
					} while (replaced);
					this.graphCursors[key] = value;
				}
				processedKeys.Add(key);
				stack.Remove(key);
			}
		}

		public ConfigurationRepository ComposeAliases(int minValueLength)
		{
			var valueToKeys = new Dictionary<string, List<string>>();
			foreach (var kvp in this.graphCursors)
			{
				var valueStr = kvp.Value?.ToString();
				if (valueStr != null && valueStr.Length >= minValueLength)
				{
					if (!valueToKeys.ContainsKey(valueStr)) valueToKeys[valueStr] = [];
					valueToKeys[valueStr].Add(kvp.Key);
				}
			}

			foreach (var kvp in this.graphCursors)
			{
				var v = kvp.Value?.ToString();
				if (v == null || v == string.Empty) continue;

				foreach (var otherKvp in this.graphCursors.Where(x => x.Key != kvp.Key))
				{
					var otherValue = otherKvp.Value?.ToString();
					if (otherValue == null) continue;
					if (otherValue.Contains(v) && valueToKeys.TryGetValue(v, out List<string>? value))
					{
						var placeholder = "{{" + value[0] + "}}";
						this.graphCursors[otherKvp.Key] = otherValue.Replace(v, placeholder);
					}
				}
			}

			return this;
		}


		/// <summary>
		/// Creates an instance-tree starting from T and populates it with correspoding values from this repository based on `ConfigurationFieldAttribute`s encountered.
		/// </summary>
		public T Compose<T>(string? parentJsonPath = null, Func<PropertyInfo, object?, object?>? inspectConfigurationProperty = null) where T : new()
		{
			var ct = typeof(T);
			var cca = ct.GetCustomAttribute(typeof(ConfigurationClassAttribute), true) as ConfigurationClassAttribute ?? throw new ArgumentException($"{ct.FullName} must have the {nameof(ConfigurationClassAttribute)}.");
			if (cca != null && cca.Nested) throw new ArgumentException($"{ct.FullName} cannot have {nameof(ConfigurationClassAttribute)}.{nameof(ConfigurationClassAttribute.Nested)} == true.");

			var jsonSerializerOptions = new JsonSerializerOptions();
			jsonSerializerOptions.Converters.Add(new JsRegexConverter());

			var result = (T?)Activator.CreateInstance(ct) ?? throw new InvalidOperationException($"{ct.FullName} has no default constructor.");
			_applyValues(result, parentJsonPath);
			return result;

			void _applyValues(object target, string? parentJsonPath = null)
			{
				var properties = target.GetType().GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
				var configurableProperties = properties.Where(prop =>
				{
					return prop.GetCustomAttribute<ConfigurationFieldAttribute>() != null;
				});
				foreach (var prop in configurableProperties)
				{
					var attr = prop.GetCustomAttribute<ConfigurationFieldAttribute>();
					Debug.Assert(attr != null);
					var fullJsonPath = parentJsonPath != null ? parentJsonPath + "." + attr.JsonPath : attr.JsonPath;

					var ct = prop.PropertyType;
					var cca = ct.GetCustomAttribute(typeof(ConfigurationClassAttribute), true) as ConfigurationClassAttribute;
					if (cca != null && !cca.Nested) throw new ArgumentException($"{ct.FullName} cannot have {nameof(ConfigurationClassAttribute)}.{nameof(ConfigurationClassAttribute.Nested)} == false.");

					if (cca != null)
					{
						var nestedInstance = Activator.CreateInstance(prop.PropertyType) ?? throw new InvalidOperationException($"{prop.PropertyType.FullName} has no default constructor.");
						_applyValues(nestedInstance, fullJsonPath);
						prop.SetValue(target, nestedInstance);
						continue;
					}
					if (!this.TryGetValue(fullJsonPath, out var databankValue)) continue;
					_setValue(target, prop, inspectConfigurationProperty?.Invoke(prop, databankValue) ?? databankValue);
				}
			}

			void _setValue(object target, PropertyInfo prop, object? value)
			{
				if (value == null)
				{
					if (prop.PropertyType.IsValueType && Nullable.GetUnderlyingType(prop.PropertyType) == null) throw new FormatException($"{prop.Name} is not nullable.");
					prop.SetValue(target, null);
				}
				else if (value is string stringValue) prop.SetValue(target, JsonSerializer.Deserialize(JsonSerializer.Serialize(stringValue), prop.PropertyType, jsonSerializerOptions));
				else if (value is List<object> listValue)
				{
					var targetType = prop.PropertyType;
					if (targetType.IsGenericType && targetType.GetGenericTypeDefinition() == typeof(List<>))
					{
						var elementType = targetType.GetGenericArguments()[0];
						var typedList = (IList)Activator.CreateInstance(targetType)!;
						foreach (var item in listValue) typedList.Add(Convert.ChangeType(item, elementType));
						prop.SetValue(target, typedList);
					}
					else if (targetType.IsArray)
					{
						var elementType = targetType.GetElementType()!;
						var array = Array.CreateInstance(elementType, listValue.Count);
						for (int length = listValue.Count, i = 0; i < length; ++i)
						{
							if (elementType == typeof(string)) array.SetValue(listValue[i]?.ToString(), i);
							else
							{
								try
								{
									array.SetValue(Convert.ChangeType(listValue[i], elementType), i);
								}
								catch (InvalidCastException)
								{
									throw new FormatException($"Cannot convert element at index {i} to type {elementType.Name} for property {prop.Name}.");
								}
							}
						}
						prop.SetValue(target, array);
					}
					else throw new FormatException($"{prop.Name} is not a compatible collection type.");
				}
				else if (_canConvertTo(value, prop.PropertyType)) prop.SetValue(target, Convert.ChangeType(value, prop.PropertyType));
				else if (_canConvertToEnum(value, prop.PropertyType)) prop.SetValue(target, Convert.ChangeType(value, Enum.GetUnderlyingType(prop.PropertyType)));
				else throw new FormatException($"{prop.Name} is not assignable to {prop.PropertyType.Name}.");

				bool _canConvertToEnum(object val, Type targetType)
				{
					if (_isNumericType(val.GetType()) && _isNumericType(targetType) && targetType.IsEnum) return Enum.IsDefined(targetType, Convert.ChangeType(val, Enum.GetUnderlyingType(targetType)));

					return false;
				}

				bool _canConvertTo(object val, Type targetType)
				{
					if (targetType.IsEnum) return false;
					if (targetType.IsAssignableFrom(val.GetType())) return true;

					if (_isNumericType(val.GetType()) && _isNumericType(targetType))
					{
						try
						{
							_ = Convert.ChangeType(val, targetType);
							return true;
						}
						catch(Exception ex)
						{
							Debug.WriteLine(ex);
							return false;
						}
					}

					return false;
				}

				bool _isNumericType(Type type)
				{
					switch (Type.GetTypeCode(type))
					{
						case TypeCode.Byte:
						case TypeCode.SByte:
						case TypeCode.UInt16:
						case TypeCode.UInt32:
						case TypeCode.UInt64:
						case TypeCode.Int16:
						case TypeCode.Int32:
						case TypeCode.Int64:
						case TypeCode.Decimal:
						case TypeCode.Double:
						case TypeCode.Single:
							return true;
						default:
							return false;
					}
				}
			}
		}


		public bool TryGetValue(string jsonPath, out object? value)
		{
			return this.graphCursors.TryGetValue(jsonPath, out value);
		}

		public List<KeyValuePair<string, object?>> Query(Regex regex)
		{
			return this.graphCursors.Where(kvp => regex.IsMatch(kvp.Key)).ToList();
		}


		public string ToJSON(bool spreadCursors = true, Regex? stripCursorMatch = null)
		{
			var jsonSerializerOptions = new JsonSerializerOptions
			{
				DefaultIgnoreCondition = JsonIgnoreCondition.Never,
				Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
				WriteIndented = true,
			};
			jsonSerializerOptions.Converters.Add(new JsRegexConverter());

			if (!spreadCursors)
			{
				var flatDictionary = this.graphCursors.OrderBy(kvp => kvp.Key)
					.ToDictionary(
						kvp => kvp.Key,
						kvp => stripCursorMatch != null && stripCursorMatch.IsMatch(kvp.Key) ? "<STRIPPED>" : kvp.Value
					);
				return JsonSerializer.Serialize(flatDictionary, jsonSerializerOptions);
			}
			else
			{
				var root = new Dictionary<string, object?>();
				foreach (var kvp in this.graphCursors.OrderByDescending(kvp => kvp.Key))
				{
					var parts = kvp.Key.Split('.');
					var current = root;
					for (int i = 0; i < parts.Length - 1; i++)
					{
						if (!current.ContainsKey(parts[i])) current[parts[i]] = new Dictionary<string, object?>();
						current = (Dictionary<string, object?>)current[parts[i]]!;
					}
					if (stripCursorMatch != null && stripCursorMatch.IsMatch(kvp.Key)) current[parts[^1]] = "<STRIPPED>";
					else current[parts[^1]] = kvp.Value;
				}
				return JsonSerializer.Serialize(root, jsonSerializerOptions);
			}
		}


		readonly Dictionary<string, object?> graphCursors = [];
	}
}
