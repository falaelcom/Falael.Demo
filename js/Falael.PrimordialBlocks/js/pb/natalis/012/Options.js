//	R0Q2?/daniel/20220323
//  - TODO: sometimes bugs and usability glitches emerge in borderline cases; remove the '?' after the code has been published on github and has shown no further bugs or usability problems 
//      for at least a year
//  - TODO: in `json()`, `definitions.value.default` is implemented as "if present, this value will be used for both a missing assignable with cardinality of 1 and an assignable with a missing value";
//      this behavior is contra-intuitive and makes it impossible to distinguish between a missing option and an assignable with a missing value; fix this
//  - TODO: in `json()`, convert the option definition list to a tree - child options are parsed/recognized only if the parent option is present; context-sensitive help command
//      - will require multi-pass option parsing
"use strict";

const { Type, CallableType } = require("-/pb/natalis/000/Native.js");
const { Exception } = require("-/pb/natalis/003/Exception.js");

// Field: Parsing the input (POSIX).
const State_Posix_Input = Symbol("State_Posix_Input");
// Field: Parsing the input immediately after an option with a value (POSIX).
const State_Posix_Value = Symbol("State_Posix_Value");
// Field: Parsing the value of an option that accepts an optional value (POSIX).
const State_Posix_MergedOptionalValue = Symbol("State_Posix_MergedOptionalValue");
// Field: Parsing the value of an option that requires a value (POSIX).
const State_Posix_MergedRequiredValue = Symbol("State_Posix_MergedRequiredValue");
// Field: Parsing the value of -Wvalue (POSIX).
const State_Posix_VendorReservedMergedValue = Symbol("State_Posix_VendorReservedMergedValue");
// Field: Parsing the value of -W value (POSIX).
const State_Posix_VendorReservedValue = Symbol("State_Posix_VendorReservedValue");
// Field: Parsing a group of options (POSIX).
const State_Posix_Group = Symbol("State_Posix_Group");
// Field: Parsing the operand list (POSIX).
const State_Posix_OperandList = Symbol("State_Posix_OperandList");

// Field: Parsing the input (GNU Arguments).
const State_Gnu_Input = Symbol("State_Gnu_Input");
// Field: Parsing a long option (GNU Arguments).
const State_Gnu_LongOption = Symbol("State_Gnu_LongOption");
// Field: Parsing a long option translated from a POSIX vendor-reserved assignable (GNU Arguments).
const State_Gnu_TranslatedLongOption = Symbol("State_Gnu_TranslatedLongOption");
// Field: Parsing a long option value (GNU Arguments).
const State_Gnu_Value = Symbol("State_Gnu_Value");
// Field: Parsing a long option merged optional value (GNU Arguments).
const State_Gnu_LongOptionMergedOptionalValue = Symbol("State_Gnu_LongOptionMergedOptionalValue");
// Field: Parsing a long option merged required value (GNU Arguments).
const State_Gnu_LongOptionMergedRequiredValue = Symbol("State_Gnu_LongOptionMergedRequiredValue");
// Field: Parsing a long option merged optional value translated from a POSIX vendor-reserved assignable (GNU Arguments).
const State_Gnu_TranslatedLongOptionMergedOptionalValue = Symbol("State_Gnu_TranslatedLongOptionMergedOptionalValue");
// Field: Parsing a long option merged required value translated from a POSIX vendor-reserved assignable (GNU Arguments).
const State_Gnu_TranslatedLongOptionMergedRequiredValue = Symbol("State_Gnu_TranslatedLongOptionMergedRequiredValue");

// Field: Parsing the input (GNU Options).
const State_GnuOptions_Input = Symbol("State_GnuOptions_Input");
// Field: Parsing an assignable (GNU Options).
const State_GnuOptions_Assignable = Symbol("State_GnuOptions_Assignable");
// Field: Parsing a vendor-reserved assignable (GNU Options).
const State_GnuOptions_VendorAssignable = Symbol("State_GnuOptions_VendorAssignable");


const Options = module.exports =

//	Class: A symmetrical parser for CLI arguments as options as recommended by POSIX and GNU.
//	Remarks: The output of symmetrical parsers contains all necessary information for the original input to be identically to recreated from it.
//  Sanity: Tested against prototype pollution.
//  See also: C# code of the same ability is available under "framework\Falael.Standard\c#\Posix\" and "framework\Falael.Standard\c#\Gnu\".
//  See also: http://bic.wiki/wiki/Falael.CommandLine
class Options
{
    //  Field: End Of Input (POSIX, GNU Arguments, GNU Options).
    static ElementType_EOI = Symbol("ElementType_EOI");
    //  Field: Option without a value (POSIX, GNU Arguments, GNU Options).
    static ElementType_Flag = Symbol("ElementType_Flag");
    //  Field: Option with a value (POSIX, GNU Arguments, GNU Options).
    static ElementType_Assignable = Symbol("ElementType_Assignable");
    //  Field: Optional value (POSIX, GNU Arguments).
    static ElementType_OptionalValue = Symbol("ElementType_OptionalValue");
    //  Field: Required value (POSIX, GNU).
    static ElementType_RequiredValue = Symbol("ElementType_RequiredValue");
    //  Field: -W or -Wvalue (POSIX, GNU Arguments).
    //  Remarks: The parser will produce elemens with this type only if `config.posix_vendorReservedAssignable` is set to `true`.
    static ElementType_VendorReservedAssignable = Symbol("ElementType_VendorReservedAssignable");
    //  Field: The value that fillows a ElementType_VendorReservedAssignable element. The parser will produce elemens with this type only if `config.posix_vendorReservedAssignable` is set to `true` (POSIX, GNU).
    static ElementType_VendorReservedValue = Symbol("ElementType_VendorReservedValue");
    //  Field: Operand (POSIX, GNU Arguments, GNU Options).
    static ElementType_Operand = Symbol("ElementType_Operand");
    //  Field: Marks the start of the operand list; generated at "--" (POSIX, GNU Arguments, GNU Options).
    static ElementType_OperandListMarker = Symbol("ElementType_OperandListMarker");
    //  Field: Long option without a value (GNU Arguments).
    static ElementType_LongFlag = Symbol("ElementType_LongFlag");
    //  Field: Long option with a value (GNU Arguments).
    static ElementType_LongAssignable = Symbol("ElementType_LongAssignable");
    //  Field: Long option optional value (GNU Arguments).
    static ElementType_LongOptionOptionalValue = Symbol("ElementType_LongOptionOptionalValue");
    //  Field: Long option required value (GNU Arguments).
    static ElementType_LongOptionRequiredValue = Symbol("ElementType_LongOptionRequiredValue");
    //  Field: Vendor long option without a value (GNU Arguments).
    static ElementType_VendorLongFlag = Symbol("ElementType_VendorLongFlag");
    //  Field: Vendor long option with a value (GNU Arguments).
    static ElementType_VendorLongAssignable = Symbol("ElementType_VendorLongAssignable");
    //  Field: Vendor long option optional value (GNU Arguments).
    static ElementType_VendorLongOptionOptionalValue = Symbol("ElementType_VendorLongOptionOptionalValue");
    //  Field: Vendor long option required value (GNU Arguments).
    static ElementType_VendorLongOptionRequiredValue = Symbol("ElementType_VendorLongOptionRequiredValue");

    //  Function: Parses the provided arguments (`process.argv.slice(2)`) and produces an object containing the parsed options initialized with their corrsponding values. Several system fields starting with a dash (`'_'`) are also produced (see the Returns section).
    //  Parameter: `args: [string]` - `process.argv.slice(2)`.
    //  Parameter: `definitions:
    //  [
    //      string,                                                                     //  defines a free text to insert in the help; will be prefixed by one new line and postfixed by two new lines
    //      {                                                                           //  defines an option definition
    //          names: [string],                                                        //  required; requires at least one non-empty string element; one-character names will be parsed as POSIX options; multi-character elements will be parsed as GNU options
    //          vendorReserved: boolean,                                                //  optional; if ommitted false is assumed; if set to true, the option definition will be added to an alternative schema of vendor-reserved properties (specied via -W); if set to true and config.posix_vendorReservedAssignable === false or config.gnu_vendorReservedTranslate === false, an exception is thrown
    //          property: string,                                                       //  optional; if ommitted, the first name from the names field will be used in the resulting json as a property name
    //          value:                                                                  //  optional; if ommitted, the option is not assignable but a flag
    //          {
    //              parser: Type.Boolean | Type.Number | Type.String | function(value){},//  required
    //              default: *                                                          //  optional; if ommitted, when this option is present a value will be required
    //                                                                                  //  if present, this value will be used for both a missing assignable with cardinality of 1 and an assignable with a missing value
    //                                                                                  //  the default value is not parsed and is not required to match the specified parser
    //          }
    //          required: boolean,                                                      //  optional; if ommitted false is assumed
    //          cardinality: positive integer,                                          //  optional; if ommitted 1 is assumed (the option may appear only once); Infinity disables cardinality check for the option
    //                                                                                  //  - cardinality == 1 will force the parser to produce a property that is set either to the value provided by the arguments or to null; multiple occurrences of the option will cause an error
    //                                                                                  //  - cardinality > 1 && cardinality < Infinity will force the parser to produce a property that is set to an array; the array will contain zero or more elements corresponding to the values provided by all occurrences of the option; for assignable option occurrences without values, null will be added to the array, and for flags - true; a number of occurrences larger than the cardinality will cause an error
    //                                                                                  //  - cardinality == Infinity will force the parser to produce a property that is set to an array; the array will contain zero or more elements corresponding to the values provided by all occurrences of the option; for assignable option occurrences without values, null will be added to the array, and for flags - true
    //          description: string,                                                    //  optional
    //          argument: string,                                                       //  optional
    //      }
    //  ]` - the definitions of accepted properties and related help text.
	//	Parameter: `config: 
	//	{
	//		posix_strict: boolean,						    //	If set to true (default), enforces the POSIX default handling as operands for all arguments after the first operand. If set to false, options and operands can be intermixed until the first "--" argument match.
	//		posix_rejectUnrecognizableArguments: boolean,	//	If set to true (default), an unrecognizable argument occurance causes and exception. If set to false, unrecognizable arguments are treated as operands. The following argument patterns are considered unrecognizable: /--.+/, /-[^\p{L}\p{N}].*/ (\p{L} matches a single code point in the category "letter"; \p{N} matches any kind of numeric character in any script). NOTE: An unrecognizable character within an option group always causes an exception.
	//		posix_vendorReservedAssignable: boolean,		//	If set to true (default), the parser treats -W as an assignable. An "Argument is invalid" exception is thrown if the schema contains the 'W' name. Will force the parser to produce ElementType_VendorReservedAssignable and ElementType_VendorReservedValue elements. If set to false, forces the parser to treat -W as described by the schema (no special treatment, non-standard).
    //      posix_rejectUnknownFlags: boolean,              //	If set to true (default), POSIX options not present in definitions will cause an error, otherwise such options will be terated as POSIX flags and will be added to the result according to the following rules: the option name will be used as a property name; the first occurrence of the option will set the corresponding property to true; on the next option occurrence the property value will be converted to an array of true values with a length corresponding to the total number of occurrences.
    //      gnu_vendorReservedTranslate: boolean,			//	If set to true (default), internally parse -W as an assignable, ommit the -W option itself from the output, parse its value as a long option and include the resulting elements to the output. If set to false, treated according to the POSIX schema and configuration (non-standard).
    //      gnu_rejectUnknownFlags: boolean,                //	If set to true (default), long flags not present in definitions will cause an error, otherwise such options will be terated as long flags and will be added to the result according to the following rules: the option name will be used as a property name; the first occurrence of the option will set the corresponding property to true; on the next option occurrence the property value will be converted to an array of true values with a length corresponding to the total number of occurrences.
    //      gnu_rejectUnknownAssignables: boolean,          //	If set to true (default), long assignables (long options followed by an equal sign) not present in definitions will cause an error, otherwise such options will be terated as long assignables with optional values and cardinality == Infinity and will be added to the result as a property with the same name as the option and a string value or null, if no value has been provided for the assignable.
	//	}` - defines the befavior of the arguments parser.
    //  Returns: `{
    //      _list: [                                        //  a list of all flags, assignables, operands and the operand list marker (--) in order of occurrence
    //          { 
    //              flag: true,
    //              posix: boolean,
    //              definitionItemIndex: positive integer | -1,
    //              optionName: string,
    //              propertyName: string,
    //          },
    //          { 
    //              assignable: true,
    //              posix: boolean,
    //              definitionItemIndex: positive integer | -1,
    //              optionName: string,
    //              propertyName: string,
    //              rawValue: string | null,
    //              value: *,
    //          },
    //          { 
    //              operand: true,
    //              value: string,
    //          },
    //          { 
    //              operandListMarker: true,
    //          },
    //      ]
    //      _operands: [string],                            //  a list of all operands in order of occurrence
    //      _operands0: [string],                           //  a list of all operands occurring before the -- in order of occurrence
    //      _operands1: [string],                           //  a list of all operands occurring after the -- in order of occurrence
    //      _vendor:                                        //  a dictionary of all vendor flags and assignables (-Wname, -Wname=value); only present if: 1. config.posix_vendorReservedAssignable === true (default), 2. config.posix_vendorReservedAssignable === true (default) and 3. at least one vendor-option is encountered
    //      {
    //          _list: [],                                      //  similar to the root _list, but without operands and without operand list markers
    //          <flag name>: true,                              //  a flag with cardinality of 1 that is present in the arguments as -Wlong-flag
    //          <flag name>: [true],                            //  a flag with cardinality more than 1 that is present in the arguments one or more times as -Wlong-flag
    //          <assignable name>: <assignable/default value>,  //  an assignable with cardinality of 1 that is present in the arguments and has a value/default value of <value> as -Wlong-assignable=<value>
    //          <assignable name>: [<assignable/default value>],//  an assignable with cardinality more than 1 that is present in the arguments one or more times with a value provided for each occurrence/default value as -Wlong-assignable=<value>
    //      },
    //      <flag name>: true,                              //  a flag with cardinality of 1 that is present in the arguments
    //      <flag name>: [true],                            //  a flag with cardinality more than 1 that is present in the arguments one or more times
    //      <assignable name>: <assignable/default value>,  //  an assignable with cardinality of 1 that is present in the arguments and has a value/default value of <value>
    //      <assignable name>: [<assignable/default value>],//  an assignable with cardinality more than 1 that is present in the arguments one or more times with a value provided for each occurrence/default value
    //  }`
    //  Exception: `"Argument is invalid"`.
    //  Exception: `"Illegal character sequence"`.
    //  Exception: `"Illegal character group"`.
    //  Exception: `"Invalid character in long option name"`.
    //  Exception: `"Not an assignble option"`.
    //  Exception: `"Value is required"`.
    //  Exception: `"Not implemented"`.
    //  Exception: `"Invalid operation"`.
    //  Exception: `"Cannot use the option more than once"`.
    //  Exception: `"Invalid boolean value provided for option"`.
    //  Exception: `"Invalid numeric value provided for option"`.
    //  Exception: `"Invalid default value for option"`.
    //  Exception: `"Invalid value provided"`.
    //  Exception: `"Option is required"`.
    //  Exception: `"Invalid option"`.
    static json(definitions, args, config)
    {
        if (PB_DEBUG)
        {
            if (!Type.isArray(args)) throw new Exception(0xE572E2, `Argument is invalid: "args".`);
            for (let length = args.length, i = 0; i < length; ++i) if (!Type.isString(args[i])) throw new Exception(0x812686, `Argument is invalid: "args". Related index: ${i}.`);
            _Options_validateDefinitions(definitions, config);
            if (!Type.isNU(config) && !Type.isNU(config.posix_rejectUnknownFlags) && !Type.isBoolean(config.posix_rejectUnknownFlags)) throw new Exception(0x7293F1, `Argument is invalid: "config.posix_rejectUnknownFlags".`);
            if (!Type.isNU(config) && !Type.isNU(config.gnu_rejectUnknownFlags) && !Type.isBoolean(config.gnu_rejectUnknownFlags)) throw new Exception(0x614354, `Argument is invalid: "config.gnu_rejectUnknownFlags".`);
        }

        const posix_rejectUnknownFlags = (!config || config.posix_rejectUnknownFlags === void 0) ? true : config.posix_rejectUnknownFlags;
        const gnu_rejectUnknownFlags = (!config || config.gnu_rejectUnknownFlags === void 0) ? true : config.gnu_rejectUnknownFlags;

        const cd = Options.crunchDefinitions(definitions);
        const parser = new Options(args, cd.parserSchema, cd.parserSchema_vendor, config);
        const occurrenceCounts = {};
        const occurrenceCounts_vendor = {};
        let operandListMarkerMatched = false;
        const result =
        {
            _list: [],
            _operands: [],
            _operands0: [],
            _operands1: [],
        };
        const result_vendor =
        {
            _list: [],
        };
        const o = {};
        while (parser.gnuOptionsGetNext(o))
        {
            switch (o.type)
            {
                case Options.ElementType_Flag:
                    {
                        const definitionItemIndex = cd.definitionItemIndexOf(o.name, o.posix);
                        if (definitionItemIndex === -1)
                        {
                            const rejectUnknownFlags = o.posix ? posix_rejectUnknownFlags : gnu_rejectUnknownFlags;
                            if (rejectUnknownFlags) throw new Exception(0x7BBB35, `Invalid option "${o.name}".`);
                            else if (!result[o.name]) result[o.name] = true;
                            else if (result[o.name] === true) result[o.name] = [true, true];
                            else result[o.name].push(true);
                            result._list.push({ flag: true, posix: o.posix, optionName: o.name, propertyName: o.name, definitionItemIndex: -1 });
                            break;
                        }
                        const definitionItem = cd.definitions[definitionItemIndex];
                        const propertyName = definitionItem.property || definitionItem.names[0];
                        switch (definitionItem.cardinality)
                        {
                            case 1:
                            case void 0:
                                if (occurrenceCounts[propertyName]) throw new Exception(0x9BBA84, `Cannot use the option more than once: "${o.name}" ("${propertyName}").`)
                                occurrenceCounts[propertyName] = 1;
                                result[propertyName] = true;
                                break;
                            case Infinity:
                                occurrenceCounts[propertyName] = (occurrenceCounts[propertyName] || 0) + 1;
                                (result[propertyName] || (result[propertyName] = [])).push(true);
                                break;
                            default:
                                if (occurrenceCounts[propertyName] + 1 > definitionItem.cardinality) throw new Exception(0xAA217B, `Maximum allowed option occurrence count exceeded: "${propertyName}" ("${o.name}"). Maximum is ${definitionItem.cardinality}.`)
                                occurrenceCounts[propertyName] = (occurrenceCounts[propertyName] || 0) + 1;
                                (result[propertyName] || (result[propertyName] = [])).push(true);
                                break;
                        }
                        result._list.push({ flag: true, posix: o.posix, optionName: o.name, propertyName, definitionItemIndex: definitions.indexOf(definitionItem) });
                    }
                    break;
                case Options.ElementType_Assignable:
                    {
                        const definitionItemIndex = cd.definitionItemIndexOf(o.name, o.posix);
                        if (definitionItemIndex === -1)
                        {
                            if(config.gnu_rejectUnknownAssignables === true) throw new Exception(0xE27384, `Invalid operation.`);
                            occurrenceCounts[o.name] = (occurrenceCounts[o.name] || 0) + 1;
                            (result[o.name] || (result[o.name] = [])).push(o.value);
                            break;
                        }
                        const definitionItem = cd.definitions[definitionItemIndex];
                        const propertyName = definitionItem.property || definitionItem.names[0];
                        const value = parseValue(propertyName, occurrenceCounts[propertyName] || 0, definitionItem.value.parser, o.value, definitionItem.value.default);
                        switch (definitionItem.cardinality)
                        {
                            case 1:
                            case void 0:
                                if (occurrenceCounts[propertyName]) throw new Exception(0xCBD92A, `Cannot use the option more than once: "${propertyName}" ("${o.name})".`)
                                occurrenceCounts[propertyName] = 1;
                                result[propertyName] = value;
                                break;
                            case Infinity:
                                occurrenceCounts[propertyName] = (occurrenceCounts[propertyName] || 0) + 1;
                                (result[propertyName] || (result[propertyName] = [])).push(value);
                                break;
                            default:
                                if (occurrenceCounts[propertyName] + 1 > definitionItem.cardinality) throw new Exception(0x759497, `Maximum allowed option occurrence count exceeded: "${propertyName}" ("${o.name}")". Maximum is ${definitionItem.cardinality}.`)
                                occurrenceCounts[propertyName] = (occurrenceCounts[propertyName] || 0) + 1;
                                (result[propertyName] || (result[propertyName] = [])).push(value);
                                break;
                        }
                        result._list.push({ assignable: true, posix: o.posix, optionName: o.name, propertyName, rawValue: o.value, value, definitionItemIndex: definitions.indexOf(definitionItem) });
                        function parseValue(optionName, occurrenceNumber, parser, value, defaultValue)
                        {
                            if (value === null) return defaultValue;
                            switch (parser)
                            {
                                case Type.String:
                                    return value;
                                case Type.Number:
                                    const numericValue = parseFloat(value);
                                    if (isNaN(numericValue)) throw new Exception(0x36E6DE, `Invalid numeric value provided for option "${optionName}[${occurrenceNumber}]".`);
                                    return numericValue;
                                case Type.Boolean:
                                    if (value === "true") return true;
                                    if (value === "false") return false;
                                    throw new Exception(0xAF9254, `Invalid boolean value provided for option "${optionName}[${occurrenceNumber}]".`);
                                default:
                                    try
                                    {
                                        return parser(value);
                                    }
                                    catch (ex)
                                    {
                                        throw new Exception(0x369BE9, `Invalid value provided for option "${optionName}[${occurrenceNumber}]".`, ex);
                                    }
                            }
                        }
                    }
                    break;
                case Options.ElementType_Operand:
                    result._operands.push(o.value);
                    if (!operandListMarkerMatched) result._operands0.push(o.value);
                    else result._operands1.push(o.value);
                    result._list.push({ operand: true, value: o.value });
                    break;
                case Options.ElementType_OperandListMarker:
                    operandListMarkerMatched = true;
                    result._list.push({ operandListMarker: true });
                    break;
                case Options.ElementType_VendorFlag:
                    {
                        const definitionItemIndex = cd.definitionItemIndexOf_vendor(o.name, o.posix);
                        if (definitionItemIndex === -1)
                        {
                            const rejectUnknownFlags = o.posix ? posix_rejectUnknownFlags : gnu_rejectUnknownFlags;
                            if (rejectUnknownFlags) throw new Exception(0xC12006, `Invalid option "${o.name}".`);
                            else if (!result_vendor[o.name]) result_vendor[o.name] = true;
                            else if (result_vendor[o.name] === true) result_vendor[o.name] = [true, true];
                            else result_vendor[o.name].push(true);
                            result_vendor._list.push({ flag: true, posix: o.posix, optionName: o.name, propertyName: o.name, definitionItemIndex: -1 });
                            break;
                        }
                        const definitionItem = cd.definitions_vendor[definitionItemIndex];
                        const propertyName = definitionItem.property || definitionItem.names[0];
                        switch (definitionItem.cardinality)
                        {
                            case 1:
                            case void 0:
                                if (occurrenceCounts_vendor[propertyName]) throw new Exception(0x79FF39, `Cannot use the option more than once: "${o.name}" ("${propertyName}").`)
                                occurrenceCounts_vendor[propertyName] = 1;
                                result_vendor[propertyName] = true;
                                break;
                            case Infinity:
                                occurrenceCounts_vendor[propertyName] = (occurrenceCounts_vendor[propertyName] || 0) + 1;
                                (result_vendor[propertyName] || (result_vendor[propertyName] = [])).push(true);
                                break;
                            default:
                                if (occurrenceCounts_vendor[propertyName] + 1 > definitionItem.cardinality) throw new Exception(0x40712D, `Maximum allowed option occurrence count exceeded: "${propertyName}" ("${o.name}"). Maximum is ${definitionItem.cardinality}.`)
                                occurrenceCounts_vendor[propertyName] = (occurrenceCounts_vendor[propertyName] || 0) + 1;
                                (result_vendor[propertyName] || (result_vendor[propertyName] = [])).push(true);
                                break;
                        }
                        result_vendor._list.push({ flag: true, posix: o.posix, optionName: o.name, propertyName, definitionItemIndex: definitions.indexOf(definitionItem) });
                    }
                    break;
                case Options.ElementType_VendorLongAssignable:
                    {
                        const definitionItemIndex = cd.definitionItemIndexOf_vendor(o.name, o.posix);
                        if (definitionItemIndex === -1)
                        {
                            if(config.gnu_rejectUnknownAssignables === true) throw new Exception(0x3D1E21, `Invalid operation.`);
                            occurrenceCounts_vendor[o.name] = (occurrenceCounts_vendor[o.name] || 0) + 1;
                            (result_vendor[o.name] || (result_vendor[o.name] = [])).push(o.value);
                            break;
                        }
                        const definitionItem = cd.definitions_vendor[definitionItemIndex];
                        const propertyName = definitionItem.property || definitionItem.names[0];
                        const value = parseValue_vendor(propertyName, occurrenceCounts_vendor[propertyName] || 0, definitionItem.value.parser, o.value, definitionItem.value.default);
                        switch (definitionItem.cardinality)
                        {
                            case 1:
                            case void 0:
                                if (occurrenceCounts_vendor[propertyName]) throw new Exception(0x8704F8, `Cannot use the option more than once: "${propertyName}" ("${o.name})".`)
                                occurrenceCounts_vendor[propertyName] = 1;
                                result_vendor[propertyName] = value;
                                break;
                            case Infinity:
                                occurrenceCounts_vendor[propertyName] = (occurrenceCounts_vendor[propertyName] || 0) + 1;
                                (result_vendor[propertyName] || (result_vendor[propertyName] = [])).push(value);
                                break;
                            default:
                                if (occurrenceCounts_vendor[propertyName] + 1 > definitionItem.cardinality) throw new Exception(0x40FBD1, `Maximum allowed option occurrence count exceeded: "${propertyName}" ("${o.name}")". Maximum is ${definitionItem.cardinality}.`)
                                occurrenceCounts_vendor[propertyName] = (occurrenceCounts_vendor[propertyName] || 0) + 1;
                                (result_vendor[propertyName] || (result_vendor[propertyName] = [])).push(value);
                                break;
                        }
                        result_vendor._list.push({ assignable: true, posix: o.posix, optionName: o.name, propertyName, rawValue: o.value, value, definitionItemIndex: definitions.indexOf(definitionItem) });
                        function parseValue_vendor(optionName, occurrenceNumber, parser, value, defaultValue)
                        {
                            if (value === null) return defaultValue;
                            switch (parser)
                            {
                                case Type.String:
                                    return value;
                                case Type.Number:
                                    const numericValue = parseFloat(value);
                                    if (isNaN(numericValue)) throw new Exception(0xD81D0B, `Invalid numeric value provided for option "${optionName}[${occurrenceNumber}]".`);
                                    return numericValue;
                                case Type.Boolean:
                                    if (value === "true") return true;
                                    if (value === "false") return false;
                                    throw new Exception(0xA0AEEC, `Invalid boolean value provided for option "${optionName}[${occurrenceNumber}]".`);
                                default:
                                    try
                                    {
                                        return parser(value);
                                    }
                                    catch (ex)
                                    {
                                        throw new Exception(0x360B06, `Invalid value provided for option "${optionName}[${occurrenceNumber}]".`, ex);
                                    }
                            }
                        }
                    }
                    break;
                default: throw new Exception(0xE719CD, `Not implemented.`);
            }
        }

        enforceOptionRules(cd.definitions, occurrenceCounts, result);
        enforceOptionRules(cd.definitions_vendor, occurrenceCounts_vendor, result_vendor);

        function enforceOptionRules(definitions, occurrenceCounts, result)
        {
            for (let length = definitions.length, i = 0; i < length; ++i)
            {
                const definitionItem = definitions[i];
                if (!Type.isObject(definitionItem)) continue;
                const propertyName = definitionItem.property || definitionItem.names[0];
                if (definitionItem.required && !occurrenceCounts[propertyName]) throw new Exception(0xD5B6B5, `Option is required: "${propertyName}".`)
                if (!occurrenceCounts[propertyName]) switch (definitionItem.cardinality)
                {
                    case 1:
                    case void 0:
                        if (definitionItem.value && definitionItem.value.default !== void 0)
                        {
                            switch (definitionItem.value.parser)
                            {
                                case Type.String:
                                    if (definitionItem.value.default !== null && !Type.isString(definitionItem.value.default)) throw new Exception(0x1B1C1B, `Invalid default value type for option "${definitionItem.names.join(", ")}"; a string value or null is expected.`);
                                    result[propertyName] = definitionItem.value.default;
                                    break;
                                case Type.Number:
                                    if (definitionItem.value.default === null)
                                    {
                                        result[propertyName] = null;
                                        break;
                                    }
                                    const numericValue = parseFloat(definitionItem.value.default);
                                    if (isNaN(numericValue)) throw new Exception(0x193ECB, `Invalid default value type for option "${definitionItem.names.join(", ")}"; a numeric value or null is expected.`);
                                    result[propertyName] = numericValue;
                                    break;
                                case Type.Boolean:
                                    if (definitionItem.value.default === null) result[propertyName] = null;
                                    else if (definitionItem.value.default === "true") result[propertyName] = true;
                                    else if (definitionItem.value.default === "false") result[propertyName] = false;
                                    throw new Exception(0x549A3C, `Invalid default value for option "${definitionItem.names.join(", ")}"; a boolean value or null is expected.`);
                                default:
                                    if (CallableType.isFunction(definitionItem.value.parser))
                                    {
                                        try
                                        {
                                            result[propertyName] = definitionItem.value.parser(definitionItem.value.default);
                                        }
                                        catch (ex)
                                        {
                                            throw new Exception(0x997D2C, `Invalid default value for option "${definitionItem.names.join(", ")}".`, ex);
                                        }
                                    }
                                    else result[propertyName] = definitionItem.value.default;
                            }
                        }
                        break;
                    default:
                        result[propertyName] = [];
                        break;
                }
            }
        }

        if (Object.keys(result_vendor).length > 1) result._vendor = result_vendor;

        return result;
    }

    //  Function: Formats the provided definitions for help printout.
    //  Parameter: `definitions` - see `Options.json`.
    //  Parameter: `settings: { newLine: string, rightMargin: integer}` - optional; `settings.newLine` defaults to `'\n'`; `settings.rightMargin` defaults to 80 and cannot be less than 40.
    //  Remarks: The printout immitates closely the help formatting of the GNU 'tar' command.
    //  Exception: `"Argument is invalid"`.
    static format(definitions, settings)
    {
        if (!settings) settings = {};
        if (!settings.newLine) settings.newLine = '\n';
        if (!settings.rightMargin) settings.rightMargin = 80;

        if (PB_DEBUG)
        {
            _Options_validateDefinitions(definitions);
            if (!Type.isString(settings.newLine)) throw new Exception(0x108876, `Argument is invalid: "formats.newLine".`);
            if (!Type.isInteger(settings.rightMargin) || settings.rightMargin < 40) throw new Exception(0x4E9157, `Argument is invalid: "formats.rightMargin".`);
        }

        const padding = "                              ";   //  30 whitespace characters

        const sb = [];

        for (let length = definitions.length, i = 0; i < length; ++i)
        {
            const item = definitions[i];
            if (Type.isString(item))    //  free text
            {
                sb.push(settings.newLine);
                sb.push(item);
                sb.push(settings.newLine);
                sb.push(settings.newLine);
                continue;
            }

            const optionNamesLines = [];
            let linePosition = 5;    //  5 characters will be printed immediately; non-configurable because of the very nature of the the POSIX option one-letter names
            let j0 = 0;
            const names = item.names.slice();
            names.sort((l, r) => l.length - r.length);
            if (names[0].length === 1)
            {
                optionNamesLines.push(" -");
                optionNamesLines.push(names[0]);
                if (names.length === 1 && item.value)
                {
                    if (item.value.default !== void 0)
                    {
                        linePosition += 1;
                        optionNamesLines.push('[');
                    }
                    if (!item.argument)
                    {
                        linePosition += 3;
                        optionNamesLines.push("ARG");
                    }
                    else
                    {
                        linePosition += item.argument.length;
                        optionNamesLines.push(item.argument);
                    }
                    if (item.value.default !== void 0)
                    {
                        linePosition += 1;
                        optionNamesLines.push(']');
                    }
                }
                optionNamesLines.push(", ");
                ++j0;
            }
            else optionNamesLines.push("     ");
            for (let jlength = names.length, j = j0; j < jlength; ++j)
            {
                const jitem = names[j];
                const optionTextSb = ["--", jitem];
                if (item.value)
                {
                    if (item.value.default !== void 0) optionTextSb.push('[');
                    optionTextSb.push('=');
                    if (!item.argument) optionTextSb.push("ARG");
                    else optionTextSb.push(item.argument);
                    if (item.value.default !== void 0) optionTextSb.push(']');
                }
                const optionText = optionTextSb.join("");

                if (linePosition + optionText.length + (linePosition > 5 ? 2 : 0) >= settings.rightMargin)
                {
                    linePosition = 5;    //  5 characters will be printed immediately; non-configurable because of the very nature of the the POSIX option one-letter names
                    optionNamesLines.push(settings.newLine);
                    optionNamesLines.push("     ");
                }
                if (linePosition > 5)
                {
                    linePosition += 2;
                    optionNamesLines.push(", ");
                }
                linePosition += optionText.length;
                optionNamesLines.push(optionText);
            }
            sb.push(optionNamesLines.join(""));
            if (linePosition >= padding.length - 1 && linePosition < padding.length + 5)
            {
                linePosition += 3;
                sb.push("   ");
            }
            else if (linePosition >= padding.length + 5)
            {
                sb.push(settings.newLine);
                sb.push(padding);
                linePosition = padding.length;
            }

            while (linePosition < padding.length)
            {
                ++linePosition;
                sb.push(' ');
            }

            const description = item.description || "(n/a)";
            for (let jlength = description.length, j = 0; j < jlength; ++j)
            {
                const jitem = description[j];
                switch (jitem)
                {
                    case ' ':
                    case '\t':
                        if (linePosition + 1 >= settings.rightMargin)
                        {
                            sb.push(settings.newLine);
                            linePosition = padding.length;
                            sb.push(padding);
                            break;
                        }
                        ++linePosition;
                        sb.push(jitem);
                        break;
                    case '\r':
                        break;
                    case '\n':
                        sb.push(settings.newLine);
                        linePosition = padding.length;
                        sb.push(padding);
                        break;
                    default:
                        ++linePosition;
                        sb.push(jitem);
                        break;
                }
            }
            sb.push(settings.newLine);
        }

        return sb.join("");
    }

    //	Parameter: `list: [string]` - a list of arguments to parse.
	//	Parameter: `schema: [{name: string, valueRequired: boolean}]` - where `valueRequired` might be ommitted.
	//	Parameter: `config: 
	//	{
	//		posix_strict: boolean,						    //	If set to true, enforces the POSIX default handling as operands for all arguments after the first operand. If set to `false`, options and operands can be intermixed until the first `"--"` argument match. Default is `true`.
	//		posix_rejectUnrecognizableArguments: boolean,	//	If set to true, an unrecognizable argument occurance causes and exception. If set to `false`, unrecognizable arguments are treated as operands. The following argument patterns are considered unrecognizable: `/--.+/`, `/-[^\p{L}\p{N}].*/` (`\p{L}` matches a single code point in the category "letter"; `\p{N}` matches any kind of numeric character in any script). An unrecognizable character within an option group always causes an exception. Default is `true`.
	//		posix_vendorReservedAssignable: boolean,		//	If set to true, the parser treats `-W` as an assignable. An `"Argument is invalid"` exception is thrown if the schema contains the `'W'` name. Will force the parser to produce `ElementType_VendorReservedAssignable` and `ElementType_VendorReservedValue` elements. If set to `false`, forces the parser to treat `-W` as described by the schema (no special treatment, non-standard). The following argument patterns are considered unrecognizable: `/--.+/`, `/-[^\p{L}\p{N}].*/`. Default is `true`.
    //      gnu_vendorReservedTranslate: boolean,			//	If set to true, internally parse as an assignable, ommit the `-W` option itself from the output, parse its value as a long option and include the resulting elements in the output. If set to `false`, treated according to the POSIX schema and configuration (non-standard). Default is `true`.
    //      gnu_rejectUnknownAssignables: boolean,          //	If set to true, long assignables (long options followed by an equal sign) not present in definitions will cause an error, otherwise such options will be terated as long assignables with optional values and cardinality == Infinity and will be added to the result as a property with the same name as the option and a string value or null, if no value has been provided for the assignable.
	//	}` - defines the befavior of the parser.
    //  Exception: `"Argument is invalid"`.
	constructor(list, schema, vendorReservedSchema, config)
	{
		if (PB_DEBUG)
		{
            if (!Type.isArray(list)) throw new Exception(0xD5BFEB, `Argument is invalid: "list".`);
			for (let length = list.length, i = 0; i < length; ++i) if (!Type.isString(list[i])) throw new Exception(0xA219BA, `Argument is invalid: "list". Related index: ${i}.`);
            if (!Type.isNU(schema))
            {
                if (!Type.isArray(schema)) throw new Exception(0x5AE91E, `Argument is invalid: "schema".`);
                for (let length = schema.length, i = 0; i < length; ++i)
                {
                    const item = schema[i];
                    if (!Type.isObject(item)) throw new Exception(0xD91926, `Argument is invalid: "schema". Related index: ${i}.`);
                    if (!Type.isString(item.name)) throw new Exception(0x70FA16, `Argument is invalid: "schema". Related index: ${i}, related field: "name".`);
                    if (item.valueRequired !== void 0 && !Type.isBoolean(item.valueRequired)) throw new Exception(0x40346D, `Argument is invalid: "schema". Related index: ${i}, related field: "valueRequired".`);
                    const outcome = Options.isAlphaNumericString(item.name, c => c === 45);
                    if (!outcome) throw new Exception(0x814D96, `Argument is invalid: "schema". Related index: ${i}, related name: "${item.name}".`);
                }
            }
            if (!Type.isNU(vendorReservedSchema))
            {
                if (!Type.isArray(vendorReservedSchema)) throw new Exception(0xB72D02, `Argument is invalid: "vendorReservedSchema".`);
                for (let length = vendorReservedSchema.length, i = 0; i < length; ++i)
                {
                    const item = vendorReservedSchema[i];
                    if (!Type.isObject(item)) throw new Exception(0x43CD1E, `Argument is invalid: "vendorReservedSchema". Related index: ${i}.`);
                    if (!Type.isString(item.name)) throw new Exception(0xD0CFDC, `Argument is invalid: "vendorReservedSchema". Related index: ${i}, related field: "name".`);
                    if (item.valueRequired !== void 0 && !Type.isBoolean(item.valueRequired)) throw new Exception(0xD2BD60, `Argument is invalid: "vendorReservedSchema". Related index: ${i}, related field: "valueRequired".`);
                    const outcome = Options.isAlphaNumericString(item.name, c => c === 45);
                    if (!outcome) throw new Exception(0xAAC61B, `Argument is invalid: "vendorReservedSchema". Related index: ${i}, related name: "${item.name}".`);
                }
            }
			if (!Type.isNU(config))
			{
				if (!Type.isObject(config)) throw new Exception(0xBEA8A4, `Argument is invalid: "config".`);
				if (config.posix_strict !== void 0 && !Type.isBoolean(config.posix_strict)) throw new Exception(0xABDEFC, `Argument is invalid: "config.posix_strict".`);
				if (config.posix_rejectUnrecognizableArguments !== void 0 && !Type.isBoolean(config.posix_rejectUnrecognizableArguments)) throw new Exception(0x3FA83F, `Argument is invalid: "config.posix_rejectUnrecognizableArguments".`);
				if (config.posix_vendorReservedAssignable !== void 0 && !Type.isBoolean(config.posix_vendorReservedAssignable)) throw new Exception(0x275AA7, `Argument is invalid: "config.posix_vendorReservedAssignable".`);
                if (config.gnu_vendorReservedTranslate !== void 0 && !Type.isBoolean(config.gnu_vendorReservedTranslate)) throw new Exception(0x9D889F, `Argument is invalid: "config.gnu_vendorReservedTranslate".`);
                if (config.gnu_rejectUnknownAssignables !== void 0 && !Type.isBoolean(config.gnu_rejectUnknownAssignables)) throw new Exception(0xE6A609, `Argument is invalid: "config.gnu_rejectUnknownAssignables".`);
			}
		}

        this.list = list;
        this.posixSchema = schema ? _Options_makePosixSchema(schema) : null;
        this.gnuSchema = schema ? _Options_makeGnuSchema(schema) : null;
        this.gnuSchema_vendor = vendorReservedSchema || null;
        this.config = Object.assign({}, config);

        this.config = this.config || {};
		this.config.posix_strict = this.config.posix_strict !== void 0 ? this.config.posix_strict : true;
		this.config.posix_rejectUnrecognizableArguments = this.config.posix_rejectUnrecognizableArguments !== void 0 ? this.config.posix_rejectUnrecognizableArguments : true;
		this.config.posix_vendorReservedAssignable = this.config.posix_vendorReservedAssignable !== void 0 ? this.config.posix_vendorReservedAssignable : true;
        this.config.gnu_vendorReservedTranslate = this.config.gnu_vendorReservedTranslate !== void 0 ? this.config.gnu_vendorReservedTranslate : true;
        this.config.gnu_rejectUnknownAssignables = this.config.gnu_rejectUnknownAssignables !== void 0 ? this.config.gnu_rejectUnknownAssignables : true;

		if (this.config.posix_vendorReservedAssignable)
		{
			if (!this.posixSchema) this.posixSchema = [{ name: 'W', valueRequired: true }];
			else if (PB_DEBUG && this.posixSchema.filter(x => x.name === 'W').length) throw new Exception(0x9B46EF, `Argument is invalid: "schema". Related entry name: 'W'`);
			else this.posixSchema.push({ name: 'W', valueRequired: true });
		}
        else if (!this.posixSchema) this.posixSchema = [];

        this.argumentOffset = 0;
        this.characterOffset = 0;
        this.posix_state = State_Posix_Input;
        this.argument = null;
        this.gnu_state = State_Gnu_Input;
        this.subOffset = 0;
        this.vendorReservedSubOffset = 0;

        this.state = State_GnuOptions_Input;
        this.assignableName = null;
        this.elementIsPosix = null;
        this.cache_isSet = false;
        this.cache_result = false;
        this.cache_elementType = null;
        this.cache_elementPosix = null;
        this.cache_elementText = null;
        this.cache_argumentOffset = -1;
        this.cache_characterOffset = -1;
    }

    //  Function: Initializes the output parameters with the information for the next element and returns `true`. At the end of the input returns `false`.
    //  Parameter: `o:
    //              {
    //                  elementType: symbol,    //  The type of the detected element. Options.ElementType_* (POSIX Arguments)
    //                  elementText: string,    //  For options holds a single character string containing the name of the option. For merged values (i.e. an option requiring a value merged with it's value in one argument) holds a text containing the value part of the argument. In all other cases holds the complete text of the source argument.
    //                  argumentOffset: integer,//  The current argument index.
    //                  characterOffset: integer,// The current character index within the current argument.
    //              }` - out parameters object
    //  Returns: Returns `false` if reached the end of the list, otherwise returns `true`.
    //  Exception: `"Illegal character sequence"`.
    //  Exception: `"Illegal character group"`.
    //  Exception: `"Value is required"`.
    //  Exception: `"Not implemented"`.
    posixGetNext(o)
	{
        while (true)
        {
            if (this.isEOI)
            {
                o.elementType = Options.ElementType_EOI;
                o.elementText = null;
                o.argumentOffset = -1;
                o.characterOffset = -1;
                return false;
            }

            const a = this.list[this.argumentOffset];
            if (!a || !a.length)
            {
                ++this.argumentOffset;
                continue;
            }
            switch (this.posix_state)
            {
                case State_Posix_Input:
                    {
                        const c0 = a[0];
                        if (c0 !== '-')
                        {
                            //  non-option element - does not begin with '-'
                            o.elementType = Options.ElementType_Operand;
                            o.elementText = a;
                            o.argumentOffset = this.argumentOffset;
                            o.characterOffset = 0;
                            ++this.argumentOffset;
                            if (this.config.posix_strict) this.posix_state = State_Posix_OperandList;
                            return true;
                        }
                        if (a.length === 1)
                        {
                            //  non-option element - a single '-'
                            o.elementType = Options.ElementType_Operand;
                            o.elementText = a;
                            o.argumentOffset = this.argumentOffset;
                            o.characterOffset = 0;
                            ++this.argumentOffset;
                            if (this.config.posix_strict) this.posix_state = State_Posix_OperandList;
                            return true;
                        }
                        const c1 = a[1];
                        if (c1 === '-')
                        {
                            if (a.length === 2)
                            {
                                //  "--"
                                o.elementType = Options.ElementType_OperandListMarker;
                                o.elementText = a;
                                o.argumentOffset = this.argumentOffset;
                                o.characterOffset = 0;
                                ++this.argumentOffset;
                                this.posix_state = State_Posix_OperandList;
                                return true;
                            }
                            //  unknown element - double '-' followed by further text
                            if (this.config.posix_rejectUnrecognizableArguments) throw new Exception(0x8BF916, `Illegal character sequence; gnu_state: ${this.posix_state.description}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                            o.elementType = Options.ElementType_Operand;
                            o.elementText = a;
                            o.argumentOffset = this.argumentOffset;
                            o.characterOffset = 0;
                            ++this.argumentOffset;
                            if (this.config.posix_strict) this.posix_state = State_Posix_OperandList;
                            return true;
                        }
                        const isAlnum = Options.isAlphaNumericString(c1);
                        if (isAlnum)
                        {
                            const assignable = this.posixSchema ? this.posixSchema.find(x => x.name === c1) || null : null;
                            if (assignable !== null)
                            {
                                //  option element with value
                                if (a.length > 2)
                                {
                                    //  value merged
                                    if (c1 === 'W' && this.config.posix_vendorReservedAssignable)
                                    {
                                        o.elementType = Options.ElementType_VendorReservedAssignable;
                                        o.elementText = c1;
                                        o.argumentOffset = this.argumentOffset;
                                        o.characterOffset = 1;
                                        this.characterOffset = 2;
                                        this.posix_state = State_Posix_VendorReservedMergedValue;
                                        return true;
                                    }
                                    else
                                    {
                                        o.elementType = Options.ElementType_Assignable;
                                        o.elementText = c1;
                                        o.argumentOffset = this.argumentOffset;
                                        o.characterOffset = 1;
                                        this.characterOffset = 2;
                                        this.posix_state = assignable.valueRequired ? State_Posix_MergedRequiredValue : State_Posix_MergedOptionalValue;
                                        return true;
                                    }
                                }
                                //  no merged value
                                if (c1 === 'W' && this.config.posix_vendorReservedAssignable)
                                {
                                    o.elementType = Options.ElementType_VendorReservedAssignable;
                                    o.elementText = c1;
                                    o.argumentOffset = this.argumentOffset;
                                    o.characterOffset = 1;
                                    ++this.argumentOffset;
                                    //  value is required, will be looking for the next value-argument
                                    if (this.isEOI) throw new Exception(0x7AD1D8, `Value is required; gnu_state: ${this.posix_state.description}, elementType: ${o.elementType.description}, elementText: ${o.elementText}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                                    this.posix_state = State_Posix_VendorReservedValue;
                                    return true;
                                }
                                else
                                {
                                    o.elementType = Options.ElementType_Assignable;
                                    o.elementText = c1;
                                    o.argumentOffset = this.argumentOffset;
                                    o.characterOffset = 1;
                                    ++this.argumentOffset;
                                    if (assignable.valueRequired)
                                    {
                                        //  value is required, will be looking for the next value-argument
                                        if (this.isEOI) throw new Exception(0x47BC4A, `Value is required; gnu_state: ${this.posix_state.description}, elementType: ${o.elementType.description}, elementText: ${o.elementText}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                                        this.posix_state = State_Posix_Value;
                                    }
                                    //  value is optional and missing
                                    else this.posix_state = State_Posix_Input;
                                    return true;
                                }
                            }
                            if (a.length > 2)
                            {
                                //  grouped options
                                o.elementType = Options.ElementType_Flag;
                                o.elementText = c1;
                                o.argumentOffset = this.argumentOffset;
                                o.characterOffset = 1;
                                this.characterOffset = 2;
                                this.posix_state = State_Posix_Group;
                                return true;
                            }
                            //  option with no value expected
                            o.elementType = Options.ElementType_Flag;
                            o.elementText = c1;
                            o.argumentOffset = this.argumentOffset;
                            o.characterOffset = 1;
                            ++this.argumentOffset;
                            return true;
                        }
                        if (this.config.posix_rejectUnrecognizableArguments) throw new Exception(0xC2D04B, `Illegal character sequence; gnu_state: ${this.posix_state.description}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                        o.elementType = Options.ElementType_Operand;
                        o.elementText = a;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = 0;
                        ++this.argumentOffset;
                        if (this.config.posix_strict) this.posix_state = State_Posix_OperandList;
                        return true;
                    }
                case State_Posix_MergedOptionalValue:
                    {
                        o.elementType = Options.ElementType_OptionalValue;
                        o.elementText = a.substring(this.characterOffset);
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = this.characterOffset;
                        ++this.argumentOffset;
                        this.posix_state = State_Posix_Input;
                        return true;
                    }
                case State_Posix_MergedRequiredValue:
                    {
                        o.elementType = Options.ElementType_RequiredValue;
                        o.elementText = a.substring(this.characterOffset);
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = this.characterOffset;
                        ++this.argumentOffset;
                        this.posix_state = State_Posix_Input;
                        return true;
                    }
                case State_Posix_VendorReservedMergedValue:
                    {
                        o.elementType = Options.ElementType_VendorReservedValue;
                        o.elementText = a.substring(this.characterOffset);
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = this.characterOffset;
                        ++this.argumentOffset;
                        this.posix_state = State_Posix_Input;
                        return true;
                    }
                case State_Posix_Value:
                    {
                        o.elementType = Options.ElementType_RequiredValue;
                        o.elementText = a;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = 0;
                        ++this.argumentOffset;
                        this.posix_state = State_Posix_Input;
                        return true;
                    }
                case State_Posix_VendorReservedValue:
                    {
                        o.elementType = Options.ElementType_VendorReservedValue;
                        o.elementText = a;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = 0;
                        ++this.argumentOffset;
                        this.posix_state = State_Posix_Input;
                        return true;
                    }
                case State_Posix_Group:
                    {
                        const c = a[this.characterOffset];
                        const assignable = this.posixSchema ? this.posixSchema.find(x => x.name === c) || null : null;
                        if (assignable !== null)
                        {
                            //  option element with value at the end of the group
                            if (a.length - this.characterOffset > 1)
                            {
                                //  value merged
                                if (c === 'W' && this.config.posix_vendorReservedAssignable)
                                {
                                    o.elementType = Options.ElementType_VendorReservedAssignable;
                                    o.elementText = c;
                                    o.argumentOffset = this.argumentOffset;
                                    o.characterOffset = this.characterOffset;
                                    ++this.characterOffset;
                                    this.posix_state = State_Posix_VendorReservedMergedValue;
                                    return true;
                                }
                                else
                                {
                                    o.elementType = Options.ElementType_Assignable;
                                    o.elementText = c;
                                    o.argumentOffset = this.argumentOffset;
                                    o.characterOffset = this.characterOffset;
                                    ++this.characterOffset;
                                    this.posix_state = assignable.valueRequired ? State_Posix_MergedRequiredValue : State_Posix_MergedOptionalValue;
                                    return true;
                                }
                            }
                            //  no merged value at the end of the group
                            if (c === 'W' && this.config.posix_vendorReservedAssignable)
                            {
                                o.elementType = Options.ElementType_VendorReservedAssignable;
                                o.elementText = c;
                                o.argumentOffset = this.argumentOffset;
                                o.characterOffset = this.characterOffset;
                                ++this.argumentOffset;
                                //  value is required, will be looking for the next value-argument
                                if (this.isEOI) throw new Exception(0xEEF28D, `Value is required; gnu_state: ${this.posix_state.description}, elementType: ${o.elementType.description}, elementText: ${o.elementText}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                                this.posix_state = State_Posix_VendorReservedMergedValue;
                                return true;
                            }
                            else
                            {
                                o.elementType = Options.ElementType_Assignable;
                                o.elementText = c;
                                o.argumentOffset = this.argumentOffset;
                                o.characterOffset = this.characterOffset;
                                ++this.argumentOffset;
                                if (assignable.valueRequired)
                                {
                                    //  value is required, will be looking for the next value-argument
                                    if (this.isEOI) throw new Exception(0xC7FF4E, `Value is required; gnu_state: ${this.posix_state.description}, elementType: ${o.elementType.description}, elementText: ${o.elementText}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                                    this.posix_state = State_Posix_Value;
                                }
                                //  value is optional and missing
                                else this.posix_state = State_Posix_Input;
                                return true;
                            }
                        }
                        const isAlnum = Options.isAlphaNumericString(c);
                        if (!isAlnum) throw new Exception(0xAAF2A1, `Illegal character group; gnu_state: ${this.posix_state.description}, argument: ${JSON.stringify(a)}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.characterOffset}.`);
                        //  it's a flag
                        o.elementType = Options.ElementType_Flag;
                        o.elementText = c;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = this.characterOffset;
                        ++this.characterOffset;
                        if (this.characterOffset >= a.length)
                        {
                            this.posix_state = State_Posix_Input;
                            ++this.argumentOffset;
                        }
                        return true;
                    }
                case State_Posix_OperandList:
                    {
                        o.elementType = Options.ElementType_Operand;
                        o.elementText = a;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = 0;
                        ++this.argumentOffset;
                        return true;
                    }
                default: throw new Exception(0x954D8F, `Not implemented.`);
            }
        }
    }

    //  Function: Initializes the output parameters with the information for the next element and returns `true`. At the end of the input returns `false`.
    //  Parameter: `o:
    //              {
    //                  elementType: symbol,    //  The type of the detected element. Options.ElementType_* (GNU Arguments)
    //                  elementText: string,    //  For options holds a single character string containing the name of the option. For merged arguments (i.e. an option requiring a value merged with it's value in one argument) holds a text containing the value part of the argument. In all other cases holds the complete text of the source argument.
    //                  argumentOffset: integer,//  The current argument index.
    //                  characterOffset: integer,// The current character index within the current argument.
    //              }` - out parameters object
    //  Returns: Returns `false` if reached the end of the list, otherwise returns `true`.
    //  Exception: `"Illegal character sequence"`.
    //  Exception: `"Illegal character group"`.
    //  Exception: `"Invalid character in long option name"`.
    //  Exception: `"Not an assignble option"`.
    //  Exception: `"Value is required"`.
    //  Exception: `"Not implemented"`.
    //  Exception: `"Invalid operation"`.
    gnuGetNext(o)
    {
        let assignable;
        while (true)
        {
            switch (this.gnu_state)
            {
                case State_Gnu_Input:

                    if (this.isEOI)
                    {
                        o.elementType = Options.ElementType_EOI;
                        o.elementText = null;
                        o.argumentOffset = -1;
                        o.characterOffset = -1;
                        return false;
                    }

                    //  preview the parsing step request
                    switch (this.posix_state)
                    {
                        case State_Posix_Input:
                            this.argument = this.list[this.argumentOffset];
                            if (this.argument.length <= 2)  //  not starting with "--"
                            {
                                const outcome = this.posixGetNext(o);
                                if (o.elementType === Options.ElementType_VendorReservedAssignable && this.config.gnu_vendorReservedTranslate) continue;
                                return outcome;
                            }
                            if (this.argument[0] !== '-' || this.argument[1] !== '-') //  not starting with "--"
                            {
                                const outcome = this.posixGetNext(o);
                                if (o.elementType === Options.ElementType_VendorReservedAssignable && this.config.gnu_vendorReservedTranslate) continue;
                                return outcome;
                            }
                            this.subOffset = 2;
                            this.gnu_state = State_Gnu_LongOption;
                            continue;
                        case State_Posix_VendorReservedMergedValue:    //  -Wname=value
                        case State_Posix_VendorReservedValue:          //  -W name=value
                            if (this.config.gnu_vendorReservedTranslate)
                            {
                                this.subOffset = 0;
                                this.vendorReservedSubOffset = this.posix_state === State_Posix_VendorReservedMergedValue ? 2 : 0;
                                const outcome = this.posixGetNext(o);
                                if (!outcome) throw new Exception(0x34235D, `Invalid operation.`);
                                this.argument = o.elementText;
                                this.gnu_state = State_Gnu_TranslatedLongOption;
                                continue;
                            }
                            else
                            {
                                return this.posixGetNext(o);
                            }
                        default:    //  only intercept "--" when in the input gnu_state of the POSIX parser, and "-W" 
                            {
                                const outcome = this.posixGetNext(o);
                                if (o.elementType === Options.ElementType_VendorReservedAssignable && this.config.gnu_vendorReservedTranslate) continue;
                                return outcome;
                            }
                    }
                case State_Gnu_LongOption:
                    {
                        //  long option; parsing its name
                        const nameAnchor = this.subOffset;
                        while (this.subOffset < this.argument.length)
                        {
                            const c = this.argument[this.subOffset];
                            if (c === '=')
                            {
                                //  end of long option name

                                if (this.subOffset === nameAnchor) throw new Exception(0x7C11C0, `Invalid operation.`);
                                o.elementText = this.argument.substr(nameAnchor, this.subOffset - nameAnchor);
                                o.elementType = Options.ElementType_LongAssignable;
                                assignable = this.gnuSchema ? _Options_gnuSchemaFind(this.gnuSchema, o.elementText) : null;
                                if (this.config.gnu_rejectUnknownAssignables === true && assignable === null) throw new Exception(0xC735E9, `Not an assignble option; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);
                                o.argumentOffset = this.argumentOffset;
                                o.characterOffset = 2;
                                ++this.subOffset;
                                if (this.subOffset === this.argument.length)
                                {
                                    //  no long option value after '='
                                    if (assignable !== null && assignable.valueRequired) throw new Exception(0x82BD9C, `Value is required; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);

                                    ++this.argumentOffset;
                                    this.gnu_state = State_Gnu_Input;
                                }
                                else this.gnu_state = (assignable !== null && assignable.valueRequired) ? State_Gnu_LongOptionMergedRequiredValue : State_Gnu_LongOptionMergedOptionalValue;
                                return true;
                            }
                            const isAlnum = Options.isAlphaNumericString(c);
                            if (!isAlnum && c !== '-') throw new Exception(0xA714A7, `Invalid character in long option name; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, null, ${this.argument}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);
                            ++this.subOffset;
                            continue;
                        }
                        //  no '=' at the end
                        o.elementText = this.argument.substr(nameAnchor);
                        assignable = this.gnuSchema ? _Options_gnuSchemaFind(this.gnuSchema, o.elementText) : null;
                        o.elementType = assignable !== null ? Options.ElementType_LongAssignable : Options.ElementType_LongFlag;
                        o.argumentOffset = this.argumentOffset;
                        o.characterOffset = 2;
                        ++this.argumentOffset;
                        if (assignable !== null && assignable.valueRequired)
                        {
                            if (this.isEOI) throw new Exception(0xF7BAAB, `Value is required; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);
                            this.gnu_state = State_Gnu_Value;
                        }
                        else this.gnu_state = State_Gnu_Input;
                        return true;
                    }
                case State_Gnu_TranslatedLongOption:
                    {
                        //  translated long option; parsing its name
                        const nameAnchor = this.subOffset;
                        while (this.subOffset < this.argument.length)
                        {
                            const c = this.argument[this.subOffset];
                            if (c === '=')
                            {
                                //  end of long option name

                                if (this.subOffset === nameAnchor) throw new Exception(0x8750EF, `Invalid operation.`);
                                o.elementText = this.argument.substr(nameAnchor, this.subOffset - nameAnchor);
                                o.elementType = Options.ElementType_VendorLongAssignable;
                                assignable = this.gnuSchema_vendor ? _Options_gnuSchemaFind(this.gnuSchema_vendor, o.elementText) : null;
                                if (this.config.gnu_rejectUnknownAssignables === true && assignable === null) throw new Exception(0x2D3296, `Not an assignble option; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);;
                                o.argumentOffset = this.argumentOffset - 1;
                                o.characterOffset = this.vendorReservedSubOffset;
                                ++this.subOffset;
                                if (this.subOffset === this.argument.length)
                                {
                                    //  no long option value after '='
                                    if (assignable !== null && assignable.valueRequired) throw new Exception(0xAA767E, `Value is required; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);

                                    this.gnu_state = State_Gnu_Input;
                                }
                                else this.gnu_state = (assignable !== null && assignable.valueRequired) ? State_Gnu_TranslatedLongOptionMergedRequiredValue : State_Gnu_TranslatedLongOptionMergedOptionalValue;
                                return true;
                            }
                            const isAlnum = Options.isAlphaNumericString(c);
                            if (!isAlnum && c !== '-') throw new Exception(0x921C03, `Invalid character in long option name; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, null, ${this.argument}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);
                            ++this.subOffset;
                            continue;
                        }
                        //  no '=' at the end
                        o.elementText = this.argument.substr(nameAnchor);
                        assignable = this.gnuSchema_vendor ? _Options_gnuSchemaFind(this.gnuSchema_vendor, o.elementText) : null;
                        o.elementType = assignable !== null ? Options.ElementType_VendorLongAssignable : Options.ElementType_VendorLongFlag;
                        o.argumentOffset = this.argumentOffset - 1;
                        o.characterOffset = this.vendorReservedSubOffset;
                        if (assignable !== null && assignable.valueRequired) throw new Exception(0xB11D4D, `Value is required; gnu_state: ${this.gnu_state.description}, ${this.posix_state.description}, ${o.elementType.description}, ${o.elementText}, argumentOffset: ${this.argumentOffset}, characterOffset: ${this.subOffset}.`);
                        else this.gnu_state = State_Gnu_Input;
                        return true;
                    }
                case State_Gnu_Value:
                    o.elementType = Options.ElementType_LongOptionRequiredValue;
                    o.elementText = this.list[this.argumentOffset];
                    o.argumentOffset = this.argumentOffset;
                    o.characterOffset = 0;
                    ++this.argumentOffset;
                    this.gnu_state = State_Gnu_Input;
                    return true;
                case State_Gnu_LongOptionMergedOptionalValue:
                    //  the rest of the argument is a long option value
                    o.elementType = Options.ElementType_LongOptionOptionalValue;
                    o.elementText = this.argument.substr(this.subOffset);
                    o.argumentOffset = this.argumentOffset;
                    o.characterOffset = this.subOffset;
                    ++this.argumentOffset;
                    this.gnu_state = State_Gnu_Input;
                    return true;
                case State_Gnu_LongOptionMergedRequiredValue:
                    //  the rest of the argument is a long option value
                    o.elementType = Options.ElementType_LongOptionRequiredValue;
                    o.elementText = this.argument.substr(this.subOffset);
                    o.argumentOffset = this.argumentOffset;
                    o.characterOffset = this.subOffset;
                    ++this.argumentOffset;
                    this.gnu_state = State_Gnu_Input;
                    return true;
                case State_Gnu_TranslatedLongOptionMergedOptionalValue:
                    //  the rest of the argument is a long option value
                    o.elementType = Options.ElementType_VendorLongOptionOptionalValue;
                    o.elementText = this.argument.substr(this.subOffset);
                    o.argumentOffset = this.argumentOffset - 1;
                    o.characterOffset = this.subOffset + this.vendorReservedSubOffset - 1;
                    this.gnu_state = State_Gnu_Input;
                    return true;
                case State_Gnu_TranslatedLongOptionMergedRequiredValue:
                    //  the rest of the argument is a long option value
                    o.elementType = Options.ElementType_VendorLongOptionRequiredValue;
                    o.elementText = this.argument.substr(this.subOffset);
                    o.argumentOffset = this.argumentOffset - 1;
                    o.characterOffset = this.subOffset + this.vendorReservedSubOffset - 1;
                    this.gnu_state = State_Gnu_Input;
                    return true;
                default: throw new Exception(0xC965F9, `Not implemented.`);
            }
        }
    }

    //  Function: Initializes the output parameters with the information for the next element and returns `true`. At the end of the input returns `false`.
    //  Parameter: `o:
    //              {
    //                  type: symbol,    //  The type of the element. Options.ElementType_* (GNU Options)
    //                  name: string,    //  The name of the element for options. null for other elements.
    //                  value: string,   //  The value of the element for assignables. The text of the element for operands and for the operand list marker. null for other elements.
    //              }` - out parameters object
    //  Returns: Returns `false` if reached the end of the list, otherwise returns `true`.
    //  Exception: `"Illegal character sequence"`.
    //  Exception: `"Illegal character group"`.
    //  Exception: `"Invalid character in long option name"`.
    //  Exception: `"Not an assignble option"`.
    //  Exception: `"Value is required"`.
    //  Exception: `"Not implemented"`.
    //  Exception: `"Invalid operation"`.
    gnuOptionsGetNext(o)
    {
        let result;
        while (true)
        {
            if (!this.cache_isSet) result = this.gnuGetNext(o);
            else
            {
                result = this.cache_result;
                o.elementType = this.cache_elementType;
                this.elementIsPosix = this.cache_elementPosix;
                o.elementText = this.cache_elementText;
                o.argumentOffset = this.cache_argumentOffset;
                o.characterOffset = this.cache_characterOffset;
                this.cache_isSet = false;
            }

            switch (this.state)
            {
                case State_GnuOptions_Input:
                    if (!result)
                    {
                        o.type = Options.ElementType_EOI;
                        o.posix = true;
                        o.name = null;
                        o.value = null;
                        return result;
                    }
                    switch (o.elementType)
                    {
                        case Options.ElementType_Flag:
                        case Options.ElementType_LongFlag:
                            o.type = Options.ElementType_Flag;
                            o.posix = o.elementType === Options.ElementType_Flag;
                            o.name = o.elementText;
                            o.value = null;
                            return result;
                        case Options.ElementType_Assignable:
                        case Options.ElementType_LongAssignable:
                            if (!result)
                            {
                                o.type = Options.ElementType_Assignable;
                                o.posix = o.elementType === Options.ElementType_Assignable;
                                o.name = o.elementText;
                                o.value = null;
                                return result;
                            }
                            if(o.elementType === Options.ElementType_Assignable && this.posix_state === State_Posix_Input)
                            {
                                o.type = Options.ElementType_Assignable;
                                o.posix = true;
                                o.name = o.elementText;
                                o.value = null;
                                return result;
                            }
                            this.assignableName = o.elementText;
                            this.elementIsPosix = o.elementType === Options.ElementType_Assignable;
                            this.state = State_GnuOptions_Assignable;
                            continue;
                        case Options.ElementType_Operand:
                            o.type = Options.ElementType_Operand;
                            o.posix = true;
                            o.name = null;
                            o.value = o.elementText;
                            return result;
                        case Options.ElementType_OperandListMarker:
                            o.type = Options.ElementType_OperandListMarker;
                            o.posix = true;
                            o.name = null;
                            o.value = o.elementText;
                            return result;
                        case Options.ElementType_VendorFlag:
                        case Options.ElementType_VendorLongFlag:
                            o.type = Options.ElementType_VendorFlag;
                            o.posix = o.elementType === Options.ElementType_VendorFlag;
                            o.name = o.elementText;
                            o.value = null;
                            return result;
                        case Options.ElementType_VendorLongAssignable:
                            this.assignableName = o.elementText;
                            this.elementIsPosix = false;
                            this.state = State_GnuOptions_VendorAssignable;
                            continue;
                        default: throw new Exception(0xBBC1AF, `Not implemented.`);
                    }
                case State_GnuOptions_Assignable:
                case State_GnuOptions_VendorAssignable:
                    if (!result)
                    {
                        o.type = (this.state === State_GnuOptions_Assignable) ? Options.ElementType_Assignable : Options.ElementType_VendorLongAssignable;
                        o.posix = this.elementIsPosix;
                        o.name = this.assignableName;
                        o.value = null;
                        this.state = State_GnuOptions_Input;
                        return true;
                    }
                    switch (o.elementType)
                    {
                        case Options.ElementType_Flag:
                        case Options.ElementType_LongFlag:
                        case Options.ElementType_Assignable:
                        case Options.ElementType_LongAssignable:
                        case Options.ElementType_Operand:
                        case Options.ElementType_OperandListMarker:
                            this.cache_result = result;
                            this.cache_elementType = o.elementType;
                            this.cache_elementPosix = o.elementType === Options.ElementType_Flag || o.elementType === Options.ElementType_Assignable;
                            this.cache_elementText = o.elementText;
                            this.cache_argumentOffset = o.argumentOffset;
                            this.cache_characterOffset = o.characterOffset;
                            this.cache_isSet = true;
                            o.type = (this.state === State_GnuOptions_Assignable) ? Options.ElementType_Assignable : Options.ElementType_VendorLongAssignable;
                            o.posix = this.elementIsPosix;
                            o.name = this.assignableName;
                            o.value = null;
                            this.state = State_GnuOptions_Input;
                            return true;
                        case Options.ElementType_OptionalValue:
                        case Options.ElementType_RequiredValue:
                        case Options.ElementType_LongOptionOptionalValue:
                        case Options.ElementType_LongOptionRequiredValue:
                            o.type = Options.ElementType_Assignable;
                            o.posix = o.elementType === Options.ElementType_OptionalValue || o.elementType === Options.ElementType_RequiredValue;
                            o.name = this.assignableName;
                            o.value = o.elementText;
                            this.state = State_GnuOptions_Input;
                            return result;
                        case Options.ElementType_VendorLongOptionOptionalValue:
                        case Options.ElementType_VendorLongOptionRequiredValue:
                            o.type = Options.ElementType_VendorLongAssignable;
                            o.posix = false;
                            o.name = this.assignableName;
                            o.value = o.elementText;
                            this.state = State_GnuOptions_Input;
                            return result;
                        default: throw new Exception(0x977565, `Not implemented.`);
                    }
                default: throw new Exception(0xDEDA15, `Not implemented.`);
            }
        }
    }

    //  Function: Prepares the option definitions for use by the parser. For internal use only.
    //  Parameter: `definitions` - option definitions.
    //  Remarks: This function has been exposed as a public member of the class for unit-testing only.
    static crunchDefinitions(definitions)
    {
        const result =
        {
            definitions: getFilteredDefinitions(definitions, false),
            definitions_vendor: getFilteredDefinitions(definitions, true),
            parserSchema: getParserSchema(definitions, false),
            fullSchema: getFullSchema(definitions, false),
            parserSchema_vendor: getParserSchema(definitions, true),
            fullSchema_vendor: getFullSchema(definitions, true),

            definitionItemIndexOf(optionName, posix)
            {
                if (posix) return this.definitions.findIndex(x =>
                {
                    return Type.isObject(x) && x.names.indexOf(optionName) !== -1;
                });
                else return this.definitions.findIndex(x =>
                {
                    if (!Type.isObject(x)) return false;
                    const partialMatch = _Options_gnuSchemaFind(this.fullSchema, optionName);
                    return x.names.indexOf(partialMatch ? partialMatch.name : null) !== -1;
                });
            },
        
            definitionItemIndexOf_vendor(optionName, posix)
            {
                if (posix) return this.definitions_vendor.findIndex(x =>
                {
                    return Type.isObject(x) && x.names.indexOf(optionName) !== -1;
                });
                else return this.definitions_vendor.findIndex(x =>
                {
                    if (!Type.isObject(x)) return false;
                    const partialMatch = _Options_gnuSchemaFind(this.fullSchema_vendor, optionName);
                    return x.names.indexOf(partialMatch ? partialMatch.name : null) !== -1;
                });
            },
        };

        return result;

        function getFilteredDefinitions(definitions, vendorReserved)
        {
            const result = [];
            for (let length = definitions.length, i = 0; i < length; ++i)
            {
                const item = definitions[i];
                if (vendorReserved === true && !item.vendorReserved) continue;
                if (vendorReserved === false && item.vendorReserved) continue;
                result.push(item);
            }
            return result;
        }

        function getParserSchema(definitions, vendorReserved)
        {
            const result = [];
            for (let length = definitions.length, i = 0; i < length; ++i)
            {
                const item = definitions[i];
                if (!Type.isObject(item)) continue;
                if (!item.value) continue;
                if (vendorReserved === true && !item.vendorReserved) continue;
                if (vendorReserved === false && item.vendorReserved) continue;
                for (let jlength = item.names.length, j = 0; j < jlength; ++j) result.push({ name: item.names[j], valueRequired: item.value.default === void 0 });
            }
            return result;
        }

        function getFullSchema(definitions, vendorReserved)
        {
            const result = [];
            for (let length = definitions.length, i = 0; i < length; ++i)
            {
                const item = definitions[i];
                if (!Type.isObject(item)) continue;
                if (vendorReserved === true && !item.vendorReserved) continue;
                if (vendorReserved === false && item.vendorReserved) continue;
                for (let jlength = item.names.length, j = 0; j < jlength; ++j) result.push({ name: item.names[j], isAssignable: !!item.value, valueRequired: item.value ? item.value.default === void 0 : false });
            }
            return result;
        }
    }

    //	Function: Test whether the provided `value` is a string consising scrictly of latin letters and numbers.
    //	Parameter: `value` - a string.
    //	Parameter: `inspect: function(c: integer): boolean` - if specified is invoked for every character with code `c` that is not an alpha-numeric character; return value of `false` causes the validation to fail immediately.
    //	Returns: `true` if the `value` is a string consising scrictly of latin letters and numbers, otherwise returns `false`.
    //	Remarks: The empty string is tested negative.
    //	Exception: `"Argument is invalid"`.
    static isAlphaNumericString(value, inspect)
    {
        if (PB_DEBUG)
        {
            if (!Type.isString(value)) throw new Exception(0x13B0E4, `Argument is invalid: "value".`);
            if (!Type.isNU(inspect) && !CallableType.isFunction(inspect)) throw new Exception(0x54C496, `Argument is invalid: "inspect".`);
        }

        switch (value.length)
        {
            case 0: return false;
            case 1:
                if (!inspect)
                {
                    const c = value.charCodeAt(0);
                    return (
                        (c > 47 && c < 58) || // numeric (0-9)
                        (c > 64 && c < 91) || // upper alpha (A-Z)
                        (c > 96 && c < 123)   // lower alpha (a-z)
                    );
                }
                else
                {
                    const c = value.charCodeAt(0);
                    if ((c > 47 && c < 58) || // numeric (0-9)
                        (c > 64 && c < 91) || // upper alpha (A-Z)
                        (c > 96 && c < 123)   // lower alpha (a-z)
                    ) return true;
                    if (PB_DEBUG)
                    {
                        const outcome = inspect(c);
                        if (!Type.isBoolean(outcome)) throw new Exception(0x8FAE97, `Callback has returned an invalid value: "value".`);
                        return outcome;
                    }
                    return inspect(c);
                }
            default:
                if (!inspect)
                {
                    for (let i = 0, length = value.length; i < length; ++i)
                    {
                        const c = value.charCodeAt(i);
                        if (!(c > 47 && c < 58) && // numeric (0-9)
                            !(c > 64 && c < 91) && // upper alpha (A-Z)
                            !(c > 96 && c < 123))  // lower alpha (a-z)
                        {
                            return false;
                        }
                    }
                }
                else
                {
                    for (let i = 0, length = value.length; i < length; ++i)
                    {
                        const c = value.charCodeAt(i);
                        if (!(c > 47 && c < 58) && // numeric (0-9)
                            !(c > 64 && c < 91) && // upper alpha (A-Z)
                            !(c > 96 && c < 123))  // lower alpha (a-z)
                        {
                            if (PB_DEBUG)
                            {
                                const outcome = inspect(c);
                                if (!Type.isBoolean(outcome)) throw new Exception(0x8FAE97, `Callback has returned an invalid value: "value".`);
                                if (!outcome) return false;
                                continue;
                            }
                            if (!inspect(c)) return false;
                        }
                    }
                }
                return true;
        }
    }

    //  Property: Equals `true` if the parser has reached the end of the list, otherwise equals `false`.
    get isEOI()
    {
        return this.argumentOffset >= this.list.length;
    }
}

function _Options_validateDefinitions(definitions, config)
{
    if (!Type.isArray(definitions)) throw new Exception(0xA27FD8, `Argument is invalid: "definitions".`);
    const usedNames = {};
    for (let length = definitions.length, i = 0; i < length; ++i)
    {
        const item = definitions[i];
        if (Type.isObject(item))
        {
            if (!Type.isNU(item.property) && !Type.isString(item.property)) throw new Exception(0x12DB51, `Argument is invalid: "definitions". Related index: ${i}. Related property: "property".`);
            if (!Type.isArray(item.names)) throw new Exception(0x296B19, `Argument is invalid: "definitions". Related index: ${i}. Related property: "names".`);
            if (!Type.isNU(item.vendorReserved) && !Type.isBoolean(item.vendorReserved)) throw new Exception(0x2221A0, `Argument is invalid: "definitions". Related index: ${i}. Related property: "vendorReserved".`);
            if (config && item.vendorReserved === true && (config.posix_vendorReservedAssignable === false || config.gnu_vendorReservedTranslate === false)) throw new Exception(0xF4B714, `Argument is invalid: "definitions". Related index: ${i}. Related property: "vendorReserved". To enable vendor-reserved property prsing, both "config.posix_vendorReservedAssignable" and "config.gnu_vendorReservedTranslate" must be set to true.`);
            if (!item.names.length) throw new Exception(0x9868B9, `Argument is invalid: "definitions". Related index: ${i}. Related property: "names".`);
            for (let jlength = item.names.length, j = 0; j < jlength; ++j)
            {
                const jitem = item.names[j];
                if (!Type.isString(jitem)) throw new Exception(0xA4B203, `Argument is invalid: "definitions". Related index: ${i}. Related property: "names[${j}]".`);
                if (usedNames[jitem]) throw new Exception(0x7F7A77, `Argument is invalid: "definitions": duplicate option name "${jitem}". Related index: ${i}. Related property: "names[${j}]".`);
                usedNames[jitem] = true;
                for (let klength = jitem.length, k = 0; k < klength; ++k)
                {
                    const kitem = jitem[k];
                    if (!Options.isAlphaNumericString(kitem) && kitem !== '-') throw new Exception(0x1DD0B5, `Argument is invalid: "definitions". Related index: ${i}. Related property: "names[${j}]".`);
                }
            }
            if (!Type.isNU(item.value))
            {
                if (!Type.isObject(item.value)) throw new Exception(0x96EA63, `Argument is invalid: "definitions". Related index: ${i}. Related property: "value".`);
                if (item.value.parser !== Type.Boolean && item.value.parser !== Type.Number && item.value.parser !== Type.String && !CallableType.isFunction(item.value.parser)) throw new Exception(0xA51291, `Argument is invalid: "definitions". Related index: ${i}. Related property: "value.parser".`);
            }
            if (!Type.isNU(item.required) && !Type.isBoolean(item.required)) throw new Exception(0x92132A, `Argument is invalid: "definitions". Related index: ${i}. Related property: "required".`);
            if (!Type.isNU(item.cardinality) && item.cardinality !== Infinity && (!Type.isInteger(item.cardinality) || item.cardinality <= 0)) throw new Exception(0xFDF3D2, `Argument is invalid: "definitions". Related index: ${i}. Related property: "cardinality".`);
            if (!Type.isNU(item.description) && !Type.isString(item.description)) throw new Exception(0x7AC72F, `Argument is invalid: "definitions". Related index: ${i}. Related property: "value.description".`);
            if (!Type.isNU(item.argument) && !Type.isString(item.argument)) throw new Exception(0x74FC27, `Argument is invalid: "definitions". Related index: ${i}. Related property: "value.argument".`);
        }
        else if (Type.isString(item)) continue;
        else throw new Exception(0xAFBC0B, `Argument is invalid: "definitions". Related index: ${i}.`);
    }
}

//	Parameter: `schema: [{name: string, valueRequired: boolean}]` - where `valueRequired` might be ommitted.
function _Options_makePosixSchema(schema)
{
    const result = [];
    for (let length = schema.length, i = 0; i < length; ++i)
    {
        const item = schema[i];
        if (item.name.length !== 1) continue;
        const c = item.name[0];
        const outcome = Options.isAlphaNumericString(c);
        if (!outcome) continue;
        result.push(item);
    }
    return result;
}

//	Parameter: `schema: [{name: string, valueRequired: boolean}]` - where `valueRequired` might be ommitted.
function _Options_makeGnuSchema(schema)
{
    const result = [];
    for (let length = schema.length, i = 0; i < length; ++i)
    {
        const item = schema[i];
        const c = item.name[0];
        const outcome = Options.isAlphaNumericString(c);
        if (item.name.length < 2 && outcome) continue;
        result.push(item);
    }
    return result;
}

function _Options_gnuSchemaFind(schema, name)
{
    const partialMatches = [];
    for (let length = schema.length, i = 0; i < length; ++i) if (schema[i].name.indexOf(name) === 0) partialMatches.push(schema[i]);
    if (partialMatches.length === 1) return partialMatches[0];
    return null;
}

module.exports.Options = module.exports;
