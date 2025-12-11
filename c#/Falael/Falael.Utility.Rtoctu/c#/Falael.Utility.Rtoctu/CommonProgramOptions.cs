//	R0Q4/daniel/20250828
using System.Text;

using Falael.Gnu.CommandLine.OptionsParser;

using Assignable = Falael.Gnu.CommandLine.ArgumentsParser.Assignable;

namespace Falael.Utility.Rtoctu
{
	public class CommonProgramOptions
	{
		public CommonProgramOptions(bool requiresConfiguration)
		{
			this.RequiresConfiguration = requiresConfiguration;
		}

		#region Nested Types

		protected class Element
		{
			public ElementType type = (ElementType)(-1);
		}

		protected class Option : Element
		{
			public string name = null!;
			public string value = null!;
		}

		public class HelpBuilder
		{
			public HelpBuilder(CommonProgramOptions programOptions, StringBuilder stringBuilder)
			{
				this.ProgramOptions = programOptions;
				this.StringBuilder = stringBuilder;
			}

			public HelpBuilder(CommonProgramOptions programOptions)
			{
				this.ProgramOptions = programOptions;
				this.StringBuilder = new();
			}

			public override string ToString()
			{
				return this.StringBuilder.ToString();
			}

			public virtual void AppendLine(string text = "")
			{
				this.StringBuilder.AppendLine(text);
			}

			public virtual void AppendHelpPreamble(string? usage = null)
			{
				this.StringBuilder.AppendLine();

				if (usage == null) this.StringBuilder.AppendLine("Usage: CLI with GNU options.");
				else if (!usage.Contains(Environment.NewLine)) this.StringBuilder.AppendLine($"Usage: {usage}");
				else
				{
					this.StringBuilder.AppendLine("Usage");
					this.StringBuilder.AppendLine();
					this.StringBuilder.AppendLine(usage);
				}

				this.StringBuilder.AppendLine();
				this.StringBuilder.AppendLine("General");
				this.StringBuilder.AppendLine();
			}

			public virtual void AppendHelpCommons()
			{
				this.StringBuilder.AppendLine();
				this.StringBuilder.AppendLine("-h, --help" + "\t\t\t" + "Prints this help message and quits.");
				this.StringBuilder.AppendLine("-v, --version" + "\t\t\t" + "Prints this programs version and quits.");
				this.StringBuilder.AppendLine("-b, --verbosity LEVEL" + "\t\t" + "Sets verbosity level to LEVEL. One of: Debug, Info (default), Warning, Error. Case sensitive.");
				if (this.ProgramOptions.RequiresConfiguration)
				{
					this.StringBuilder.AppendLine("-c, --config-file PATH" + "\t\t" + "Required. Specifies a path to the application configuration file; the file must exist except if the --create-config-file option is specified.");
					this.StringBuilder.AppendLine("    --create-config-file" + "\t\t" + "If present, will attempt to create a new application configuration file at the path specified by --config-file; will fail if the file already exists.");
				}
				this.StringBuilder.AppendLine();
			}

			public virtual void AppendHelpPostamble()
			{
				this.StringBuilder.AppendLine();
			}

			public CommonProgramOptions ProgramOptions { get; }
			public StringBuilder StringBuilder { get; }
		}

		#endregion

		public virtual string GetHelpPrintout()
		{
			HelpBuilder hb = new(this);

			hb.AppendHelpPreamble();
			hb.AppendHelpCommons();
			hb.AppendHelpPostamble();

			return hb.ToString();
		}

		protected void ParseInternal(Assignable[] gnuAssignableOptions, string[] args, Action<string> onFlag, Action<string, string> onAssignable, Action<string>? onOperand = null)
		{
			var elements = this.RequiresConfiguration 
				? FromGnuArguments(args,
				[.. gnuAssignableOptions.Concat([
					new("b"),
					new("verbosity"),
					new("c"),
					new("config-file"),
				])])
				: FromGnuArguments(args,
				[.. gnuAssignableOptions.Concat([
					new("b"),
					new("verbosity"),
				])]);

			for (int length = elements.Count, i = 0; i < length; ++i)
			{
				var item = elements[i];
				switch (item.type)
				{
					case ElementType.Flag:
						var option = (Option)item;
						switch (option.name)
						{
							case "h":
							case "help":
								this.HelpFlag = true;
								break;
							case "v":
							case "version":
								this.VersionFlag = true;
								break;
							case "create-config-file":
								if (this.RequiresConfiguration) this.CreateConfigFileFlag = true;
								else onFlag(option.name);
								break;
							default:
								onFlag(option.name);
								break;
						}
						break;
					case ElementType.Assignable:
						var assignableOption = (Option)item;
						switch (assignableOption.name)
						{
							case "b":
							case "verbosity":
								this.Verbosity = assignableOption.value;
								break;
							case "c":
							case "config-file":
								if(this.RequiresConfiguration) this.ConfigFilePath = assignableOption.value;
								else onAssignable(assignableOption.name, assignableOption.value);
								break;
							default:
								onAssignable(assignableOption.name, assignableOption.value);
								break;
						}
						break;
					case ElementType.Operand:
						var operand = (Option)item;
						onOperand?.Invoke(operand.value);
						break;
					case ElementType.OperandListMarker:
					case ElementType.EOI:
						break;
					default:
						throw new NotImplementedException();
				}
			}
		}

		protected static List<Element> FromGnuArguments(string[] args, Assignable[] gnuAssignableOptions)
		{
			List<Element> result = [];
			if (args.Length == 0) return result;

			var parser = new Parser(new Falael.Gnu.CommandLine.ArgumentsParser.Parser(args, gnuAssignableOptions));
			while (parser.GetNext(out ElementType type, out _, out string name, out string value))
			{
				switch (type)
				{
					case ElementType.Flag:
						result.Add(new Option { type = type, name = name });
						break;
					case ElementType.Assignable:
						result.Add(new Option { type = type, name = name, value = value });
						break;
					case ElementType.Operand:
						result.Add(new Option { type = type, value = value });
						break;
				}
			}
			return result;
		}


		public bool RequiresConfiguration { get; }

		public bool VersionFlag { get; private set; } = false;
		public bool HelpFlag { get; private set; } = false;
		public bool CreateConfigFileFlag { get; private set; } = false;
		public string Verbosity { get; private set; } = "Info";
		public string? ConfigFilePath { get; private set; } = null;
	}
}
