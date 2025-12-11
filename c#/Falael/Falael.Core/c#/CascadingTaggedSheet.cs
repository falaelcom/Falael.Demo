using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Falael.Core
{
	public class CascadingTaggedSheet
	{
		public CascadingTaggedSheet(CstTemplate cstTemplate)
		{
			switch (cstTemplate)
			{
				case CstTemplate.Disabled:
					this.properties = [new("disabled", true)];
					break;
				case CstTemplate.Blank:
					this.properties = [];
					break;
				default: throw new NotImplementedException(cstTemplate.ToString());
			}
		}

		protected CascadingTaggedSheet(List<KeyValuePair<string, object?>> properties)
		{
			this.properties = properties;
		}

		public static CascadingTaggedSheet TryParseJson(string json)
		{
			return new CascadingTaggedSheet(SortProperties(ReadDeflateJson(json)));
		}


		public enum CstTemplate
		{
			Disabled,
			Blank,
		}


		public List<KeyValuePair<string, object?>> QueryProperties(string[] tags)
		{
			var result = new List<KeyValuePair<string, object?>>();

			var normalizedTags = new HashSet<string>(tags);
			var addedLeaves = new HashSet<string>();

			foreach (var property in this.properties)
			{
				var pathSections = property.Key.StartsWith('.')
					? property.Key[1..].Split('.')
					: property.Key.Split('.');
				var leafName = pathSections.Last();
				var pathWithoutLeaf = pathSections.Take(pathSections.Length - 1);

				if (addedLeaves.Contains(leafName)) continue;
				if (!normalizedTags.IsSupersetOf(pathWithoutLeaf)) continue;

				addedLeaves.Add(leafName);
				result.Add(new KeyValuePair<string, object?>(leafName, property.Value));
			}

			return result;
		}

		public object? QueryPropertyValue(string[] tags, string propertyName, object? defaultValue = null)
		{
			var normalizedTags = new HashSet<string>(tags);
			foreach (var property in this.properties)
			{
				var pathSections = property.Key.StartsWith('.') ? property.Key[1..].Split('.') : property.Key.Split('.');
				var leafName = pathSections.Last();
				var pathWithoutLeaf = pathSections.Take(pathSections.Length - 1);

				if (leafName != propertyName) continue;
				if (!normalizedTags.IsSupersetOf(pathWithoutLeaf)) continue;

				if (property.Value is string stringValue) return Regex.Replace(stringValue, @"!important\s*\(\s*(-?\d+)\s*\)", string.Empty, RegexOptions.IgnoreCase);
				return property.Value;
			}

			return defaultValue;
		}

		static List<KeyValuePair<string, object?>> ReadDeflateJson(string json)
		{
			var result = new List<KeyValuePair<string, object?>>();
			if (string.IsNullOrEmpty(json)) return result;
			var value = JsonNode.Parse(json);
			if (value == null) return result;
			__processNode(value, string.Empty);
			return result;

			void __processNode(JsonNode node, string parentPath)
			{
				if (node == null) return;
				foreach (var property in node.AsObject())
				{
					if (property.Key.StartsWith('.'))
					{
						if (property.Value == null) continue;
						__processNode(
							property.Value,
							string.IsNullOrEmpty(parentPath) ? property.Key : $"{parentPath}{property.Key}"
						);
						continue;
					}
					result.Add(new KeyValuePair<string, object?>(
						string.IsNullOrEmpty(parentPath) ? property.Key : $"{parentPath}.{property.Key}",
						_convertJsonElement(property.Value)
					));
				}
			}

			object? _convertJsonElement(JsonNode? node)
			{
				if (node == null) return null;

				return node switch
				{
					JsonValue value when value.TryGetValue<JsonElement>(out var element) => __convertJsonElementValue(element),
					JsonObject obj => obj, // or handle as needed
					JsonArray arr => arr,  // or handle as needed
					_ => node.ToString()
				};
			}

			object? __convertJsonElementValue(JsonElement element)
			{
				return element.ValueKind switch
				{
					JsonValueKind.Number => element.TryGetInt32(out int intValue) ? intValue : (object)element.GetDouble(),
					JsonValueKind.String => element.GetString(),
					JsonValueKind.True => true,
					JsonValueKind.False => false,
					JsonValueKind.Null => null,
					_ => element.GetRawText()
				};
			}

		}

		static List<KeyValuePair<string, object?>> SortProperties(List<KeyValuePair<string, object?>> properties)
		{
			return [.. properties
				.OrderByDescending(kvp => __extractImportance(kvp.Value))
				.ThenByDescending(kvp => __getSpecificity(kvp.Key))
				.ThenBy(kvp => kvp.Key)];

			int __extractImportance(object? value)
			{
				if (value is string str && str.Contains("!important"))
				{
					var match = Regex.Match(str, @"!important\(([-\d]+)\)");
					if (match.Success && int.TryParse(match.Groups[1].Value, out int importance)) return importance;
				}
				return 0;
			}
			int __getSpecificity(string key)
			{
				return key.Count(c => c == '.');
			}
		}

		readonly List<KeyValuePair<string, object?>> properties;

		#region Unit Tests

#pragma warning disable CS8605 // Unboxing a possibly null value.
#pragma warning disable CS8602 // Dereference of a possibly null reference.
		public static void UnitTests()
		{
			string json;
			CascadingTaggedSheet sheet;
			List<KeyValuePair<string, object?>> result;

			//	test 000
			json = "";
			sheet = TryParseJson(json);
			if (sheet.properties.Count != 0) throw new InvalidOperationException("Test 000 failed.");

			// Test 001: Empty JSON
			json = @"{}";
			sheet = TryParseJson(json);
			if (sheet.properties.Count != 0) throw new InvalidOperationException("Test 001 failed.");

			// Test 002: Root Property
			json = @"{
				""rootProp"": 123
			}";
			sheet = TryParseJson(json);
			if (sheet.properties.Count != 1 || !sheet.properties.Any(kvp => kvp.Key == "rootProp" && (int)kvp.Value == 123))
				throw new InvalidOperationException("Test 002 failed.");

			// Test 003: Cascading Properties for Specificity
			json = @"{
				"".a"": {""prop"": 1}, 
				"".b"": {""prop"": 2}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a"]);
			if (result.Count != 1 || !result.Any(kvp => kvp.Key == "prop" && (int)kvp.Value == 1))
				throw new InvalidOperationException("Test 003 failed.");

			// Test 004: Importance Overrides Specificity
			json = @"{
				"".a"": {""prop"": ""!important(1)""}, 
				"".b"": {""prop"": ""!important(2)""}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a", "b"]);
			if (result.Count != 1 || !result.Any(kvp => kvp.Key == "prop" && kvp.Value.ToString() == "!important(2)"))
				throw new InvalidOperationException("Test 004 failed.");

			// Test 005: Equal Specificity, Resolved Alphabetically
			json = @"{
				"".b"": {"".a"": {""c"": 2}},
				"".a"": {"".b"": {""c"": 1}}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a", "b"]);
			if (result.Count != 1 || !result.Any(kvp => kvp.Key == "c" && (int)kvp.Value == 1))
				throw new InvalidOperationException("Test 005 failed.");

			// Test 006: Equal Specificity with Importance
			json = @"{
				"".a"": {"".b"": {""c"": ""!important(1)""}}, 
				"".b"": {"".a"": {""c"": ""!important(2)""}}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a", "b"]);
			if (result.Count != 1 || !result.Any(kvp => kvp.Key == "c" && kvp.Value.ToString() == "!important(2)"))
				throw new InvalidOperationException("Test 006 failed.");

			// Test 007: Multiple Properties in the Result
			json = @"{
				"".a"": {""prop1"": 1, ""prop2"": 2}, 
				"".b"": {""prop3"": 3}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a"]);
			if (result.Count != 2 || !result.Any(kvp => kvp.Key == "prop1" && (int)kvp.Value == 1) || !result.Any(kvp => kvp.Key == "prop2" && (int)kvp.Value == 2))
				throw new InvalidOperationException("Test 007 failed.");

			// Test 008: Multiple Properties with Mixed Specificity
			json = @"{
				"".a"": {""prop1"": ""!important(1)""}, 
				"".b"": {""prop1"": 1, ""prop2"": 2}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a", "b"]);
			if (result.Count != 2 || !result.Any(kvp => kvp.Key == "prop1" && kvp.Value.ToString() == "!important(1)") || !result.Any(kvp => kvp.Key == "prop2" && (int)kvp.Value == 2))
				throw new InvalidOperationException("Test 008 failed.");

			// Test 009: Multiple Properties with Equal Specificity and Importance
			json = @"{
				"".a"": {""prop"": ""!important(1)""}, 
				"".b"": {""prop"": ""!important(1)""},
				"".c"": {""prop"": 3}
			}";
			sheet = TryParseJson(json);
			result = sheet.QueryProperties(["a", "b", "c"]);
			if (result.Count != 1 || !result.Any(kvp => kvp.Key == "prop" && kvp.Value.ToString() == "!important(1)"))
				throw new InvalidOperationException("Test 009 failed.");
		}
#pragma warning restore CS8602 // Dereference of a possibly null reference.
#pragma warning restore CS8605 // Unboxing a possibly null value.

		#endregion
	}
}