Primordial Blocks
=====================================

Primordial Blocks is a layered JavaScript framework for backend (NodeJS) and frontend (pure JavaScript) with minimalistic inter- and no intra-dependencies other than to platform-integrated (i.e. integrated in NodeJS and the web browser) APIs. Intra-dependencies are regulated by design: every layer of code is allowed to refer only code from lower layers, which in principle defines the concept of "layer" within the framework. This layered approach, among other things, acheives a very simple dependency sorting - sorting the the framework files by layer is enough to ensure dependency consistency.

Basic Concepts
=====================================

Layers
-------------------------------------

The Primordial Blocks code is organized in files, which in turn are grouped in numbered layers. A layer is a collection of files that are allowed to refer only to files from lower-level layers, and:

- frontend files are allowed to refer to the browser's JavaScript API;
- backend files are allowed to refer to the NodeJS API;
- universal-purpose files are not allowed to have any external dependencies; they refer only to JavaScript features that are universally supported across all platforms (web browsers, NodeJS and React Native).

Within the framework, by rule, a layer's name is its number, formatted as a three-digit non-negative decimal integer left-padded with zeroes, e.g. "000" or "999".

Code collections
-------------------------------------

By rule, the Primordial Blocks code is organized in the following code collections:

- dion - code that is runnable only in the backend (NodeJS);
- xenesio - code that is runnable only in the frontend (web browser);
- natalis - code that is runnable on all platforms.

NOTE on naming: Dion is an elfish name associated with the divine love, stability and order - qualities desired for an ever-lasting web server. Xenesio is a deamon name associated with chaos, dynamics and mobility - qualities seemingly characterstic for any mature front-end code. Natalis is the name of a saint combining both the divine love and hellish suffering, symbolizing the union between the backend and frontend development realms.

Testing Playground
-------------------------------------

- zen - the name of a Visual Studio solution and a NodeJS project created for performing various administrative tasks such as exploring the framework, running unit tests, running performance tests, building a single frontend include file etc.

NOTE on naming: Zen brings the concept of achieving ultimate peace (of mind), which, in the case with Primordial Blocks, is accomplished by providing a way to test the code.

Exceptions
-------------------------------------
All exceptions thrown by Primordial Blocks are `Exception`- (which extends `Error`) or `Error` objects with most of the details included in the message, e.g. ``throw new Exception.ArgumentException(0x000000, "value", value);``, ``throw new Exception(0x000000, `Argument is invalid: "value".`);``, ``throw new Error(`0x000000 Argument is invalid: "value".`);`` or ``throw new Error(`Unsupported runtime.`);``. By rule, all messages of similar exceptions start with the same string, designated as an exception signature. Exception signatures can be used for exception message parsing and exception type determination. There is no guarantie that an exception thrown by the Primordial Blocks framework will be of a particular type beyond `Error` - depending on the context, some exceptions are thrown as `Error` instances, other as `Exception` instances and other as a specific exception type like `Exception.ArgumentException`.

The `Exception` class construction requires a unique within Primordial Blocks integer code to be passed as a first argument of the cosntructor, e.g. ``throw new Exception(0x000001, `Not implemented.`);``; error codes are serialized by the `Exception` class as six-hexdigit hexdecimal strings (`"0x000000"`) and, for faster lookup, are recommended to be provided the same way in exception construction. A similar convention is used when creating `Error` objects in contexts when the `Exception` class is unavailable, whereas the unique code is prepended before the message as a six-hexdigit hexdecimal followed by a single space: ``throw new Error(`0x000000 Argument is invalid: "value".`);``. The only exception to this convention is the ``throw new Error(`Unsupported runtime.`);`` statement, which appears on the top of every non-natalis file and is provided without an exception code.

Some exception signatures are generalized into specific exception classes, g.e. `Exception.ArgumentException`. At the moment there is no guarantie that an exception with the corresponding signature will always be thrown via such a class, though, because legacy Primordial Blocks code still uses the ``throw new Exception(0x000000, `Argument is invalid: "value".`);`` variant.

Here is a list of all exception signatures found in the code:

- General purpose exceptions
	- "Unsupported runtime" - thrown by the framework when an attempt is been made to load a javascript file or to execute a funtion in an unsupported environment, e.g. when loading a xenesio-only file, strictly deisgned for the web browser, in dion (nodejs), or invoking an "abstract" (i.e. throwing an exception and requiring an override) method from natalis that is not overridden in the current running environment; in most cases this exception is thrown from the first line of a file as a native `Error` instead of a Primordial Blocks `Exception`. This exception has been specifically designed for the aforementioned purposes and should never be used in a different context. See next `"Not supported"` that provides a general-purpose alternative to the `"Unsupported runtime"` exception.
	- "Not supported" - thrown to indicate that a required running environment precondition has not been met; this exception provides a wider-use alternative to `"Unsupported runtime"` and can be used freely throughout the code.
	- "Bad exception" - thrown by an `Exception` constructor to indicate invalid constructor arguments; usually provides information about the original exception as well. All exceptions of this signature are of type `Error`.
	- "Not implemented" - thrown to indicate that a particular function, method or conditional block has not been implemented; used often in the `default` clause of `switch`-`case` statements that are expected to exhaust all possible cases.
	- "Validation failed" - thrown when a data validation has failed in a context not covered by any other validation-related exception, see next. Exception class: `Exception.ValidationFailedException`.
	- "Argument is invalid" - thrown when the validation of the value of a function parameter (an argument) has failed. Exception class: `Exception.ArgumentException`.
	- "Argument is out of range" - thrown when the value of a function parameter (an argument) is outside an acceptable range.
	- "Key is invalid" - thrown during dictionary key enumeration when a key is encoutered that is not allowed in the current context (e.g. a reserved key word is used as a data key).
	- "Callback has returned an invalid value" - thrown when the validation of the return value of callback function has failed. Exception class: `Exception.ReturnValueException`.
	- "Enum value is invalid" - thrown when an enum value of an unsupported type is passed to an `Enum` declaration. Supported types include `Type.Boolean`, `Type.Number`, `Type.String` and `Type.Symbol`.
	- "Circular reference" - thrown during a data structure traversal when a cirtcular reference is detected that cannot be automatically processed and no fallback mechanism is provided.
	- "Merge conflict" - thrown when a merge operation cannot be completed because of a merge gonflict.
	- "Format is invalid" - thrown when any data is parsed (might be a string, an object or any other input data format) and a unrecoverable syntactical or structural violation is encoutered.
	- "Invalid operation" -  thrown when an operation has been executed in an invalid program state (usually indicates a bug). Exception class: `Exception.InvalidOperationException`.
	- "Operation timeout" - thrown when an operation fails to finish within a given timeout.
	- "Delegation failed" - thrown when a unicast or multicast invokation failed with an exception; usually embeds the thrown exception as an innner exception.
	- "Unauthorized" - thrown when an operation requires additional authorization.

- Configuration exceptions
	- "Configuration group schema is missing"
	- "Configuration schema array field definition is invalid"
	- "Configuration groups can only contain environment sections, the \"common\" section and the \"clientExport\" section"
	- "Configuration section \"clientExport\" must be an array"
	- "Configuration snippet schema is prohibited"
	- "Configuration snippet clientExport is prohibited"
	- "Configuration field not in schema"
	- "Configuration validation failed"

- Schema exceptions
	- "Invalid schema definition"
	- "Unsupported schema definition type"
	- "Unrecognized validator key"
	- "Duplicate type definition"
	- "The \"match\" directive will have no effect"
	- "Invalid \"also\" schema definition type"
	- "Invalid \"also\" schema definition value type"
	- "Invalid \"alt\" schema definition type"
	- "Invalid \"any\" schema definition"
	- "Invalid \"array\" schema definition type"
	- "Invalid \"boolean\" schema definition"
	- "Invalid \"objex\" schema definition type"
	- "Invalid \"objex\" schema definition"
	- "Invalid \"hint\" schema definition type"
	- "Invalid \"match\" schema definition type"
	- "Invalid \"number\" schema definition"
	- "Invalid \"object\" schema definition type"
	- "Invalid \"object\" schema definition"
	- "Invalid \"string\" schema definition"
	- "Invalid schema definition directive"
	
- POSIX and GNU arguments and options parser (PosixArguments, ???) exceptions
	- "Illegal character sequence"
	- "Illegal character group"
	- "Invalid character in long option name"
	- "Value is required"
	- "Not an assignble option"
	- "Maximum allowed option occurrence count exceeded"
	- "Cannot use the option more than once"
	- "Invalid boolean value provided for option"
	- "Invalid numeric value provided for option"
	- "Invalid default value for option"
	- "Invalid value provided"
	- "Option is required"
	- "Invalid option"

Debugging
-------------------------------------
The global variable PB_DEBUG is required by almost all functions both on the backend and on the frontend. Setting PB_DEBUG to false yields a significant performance boost as a result of turning off:

- all function parameter validation code.
- callback return value validation code.

Global Variables
-------------------------------------
Primordial Blocks relies on a set of required predefined global variables to define its behavior:

- `<meta name="global::PB_DEBUG" content="true" />` - `PB_DEBUG: boolean` - If set to `true` enforces the execution of all debugging code throught the framework, otherwise the debugging code won't be executed; runtime value validations for global variables and function arguments are the primary facility used for debugging by Primordial Blocks and are all governed by `PB_DEBUG`.

- `<meta name="boot::ROUTE" rel="-/pb/natalis" content="natalis" />`
- `<meta name="boot::PB_DEBUG_MANIFEST" content="/pb-debug-manifest.json" />`
- `<meta name="context::CONFIG" content='{}' />`
- `<meta name="context::VERSION" content='{ "major": 0, "minor": 1, "text": "0.1" }' />`

General Principles
=====================================

Array Instantiation
-------------------------------------
Primordial Blocks gives extra attention to memory management. Array instantiation is one of the major memory operations of concern. The following are the measures provisioned by Primordial Blocks in relation to that concern:

### Avoiding Subclassing

Creating new array instances from classes that extend Array has proven to be significantly slower than creating new arrays directly via `[]` or `new Array(N)`. To remedy that Primordial Blocks facilitates direct array instantiation
combined with specifying array type as an arbitrary `Symbol`.

`Compound.js` defines the following arrays extended with type:

- `cost` - Compound Structure - a structured typed array of the form `[<arrayTypeSymbol>, <arrayElement0>, <arrayElement1>, ...]`.
- `carr` - Compound Array - a typed array of the form `arr === [<arrayElement0>, <arrayElement1>, ...]`, `arr.PB_compoundType === <arrayTypeSymbol>`.
- `cbuf` - Compound Buffer - a typed buffered array of the form `arr === [<arrayElement0>, <arrayElement1>, ..., (empty)]`, `arr.length === <bufferLength>`, `arr.count === <actualDataLength>`, `arr.PB_compoundType === <arrayTypeSymbol>`.

All arrays extended with type provide a way to specify an array type as a `Symbol` instead of using inheritance to define a new `Array` type.

### Buffering

`Compound.js` defines the following arrays extended with logical element count:

- `buf` - Compound -  a generic buffered array of the form `arr === [<arrayElement0>, <arrayElement1>, ..., (empty)]`, `arr.length === <bufferLength>`, `arr.count === <actualDataLength>`.
- `cbuf` - Compound Buffer - a typed buffered array of the form `arr === [<arrayElement0>, <arrayElement1>, ..., (empty)]`, `arr.length === <bufferLength>`, `arr.count === <actualDataLength>`, `arr.PB_compoundType === <arrayTypeSymbol>`.

All arrays extended with logical element count provide a way to specify a count of element actually used in the array that is different from array's physical length, allowing for memory preallocation and reusing previously allocated memory.

### Pooling

`Compound.js` defines the following facilities for memory pooling:

- `BufPool` - a buffer pool optimized for performance (10-25x faster) with frequent creation and destruction of buffers (`buf`) and compound buffers (`cbuf`).
- `BufPoolTransaction` - represents a subset of `buf`s/`cbuf`s from a specified `BufPool` being held as part of a single transaction. Allows for bulk release of all registered `buf`s/`cbuf`s.

Array Instantiation - Freedom of Choice
-------------------------------------

Primordial Blocks recognizes two types of array processing- or generating functions in regards of memory management:

- Creators - functions that only write to a `target` array;
- Translators - functions that read from a `source` array and write to a `target` array.
- List Translators - functions that read from a `source` array of arrays and write to a `target` array of arrays.

To guarantee that memory allocation can always be delegated to the function caller, Primordial Blocks enforces for all Creators and Translators an additional optional parameter `target: array`. Depending on the type of the function (Creators 
or Translators), the handling of the `target` parameter varies as described next.

- Creators - if `target` is set when the function is invoked, the function overwrites the elements of the provided `target` array, otherwise a new array is created; in either case the array being written into is returned by the function.
- Translators - if `target` is set when the function is invoked, the function overwrites the elements of the provided `target` array in such a way that if the `target` array is the same instance as the `source` array, the translation
	process won't overwrite existing source data before it has been successfully processed; if `target` is not set, the source is used as a default target, effectively defaulting to mutating the source array; in either case the array 
	being written into is returned by the function.
- List Translators - TODO

In other words, Translators' default behavior is to modify the provided instance, while giving the function user the opportunity to provide an alternative target array, rendering the source's state immutable. Because Creators don't have
a source parameter, by default they write into a new array unless a `target` array has been explicitly provided by the function user.

