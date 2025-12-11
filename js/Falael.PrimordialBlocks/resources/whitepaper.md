Status
===========================
This is a working draft of Transcribe Protocol v1.0. This document will most likely go through hevy changes before reaching maturity.

Transcribe Protocol v1.0
===========================

Abstract
-------------------

Trancribe Protocol v1.0 describes the terms, principles and practical considerations for _transcription_ of _arcs_ (directed graph edges) of one or more [directed multigraphs](https://en.wikipedia.org/wiki/Directed_graph) into a new or existing [graph](https://en.wikipedia.org/wiki/Graph).

Common examples of graph _transcription_ would be:

- serialization - the transcription of a _source_ directed multigraph into an array of characters or bytes (a form of directed multigraph itself);
- deserialization - the transcription of a _source_ array of characters or bytes into a directed multigraph;
- cloning - the transcription of a _source_ directed multigraph into a directed multigraph identical to the original;
- filtering - the transcription of a _source_ directed multigraph into a graph containing a subset of the _source's_ graph _arcs_;
- sorting - the transcription of a _source_ directed multigraph into a multigraph containing the same _vertices_ and _arcs_ where _arcs_ starting from some _vertices_ are organized in a potentially different order;
- comparison - the transcription of two _source_ directed multigraphs into a _target_ graph representing the differences between the two (not covered by _Trancribe Protocol v1.0_).

Examples of real-life situations making heavy use of graph _transcriptions_ would be:

- source control operations;
- IMAP email synchronization;
- differential directory backups.

Trancribe Protocol v1.0 implies that a finite traversal of a _source_ graph is possible, starting from a chosen single _root_ _vertex_ and visiting all graph _arcs_ in a well-defined order without redundancy. As a direct implication, graphs containing isolated _vertices_ or isolated subgraphs are not a subject of this documentation, as such setups imply more than one _root_ _vertices_.

This document uses JavaScript code and lingo to illustrate theoretical concepts and to translate abstract terminology to programming terms. _Oblique styling_ is used to indicate terminology that has a definition in this document or, when applied on whole sentences, indicates a side note.

Motivation
-------------------

Trancribe Protocol v1.0 aims at solving some basic challenges encountered during the development of complex operations on graphs:

- __Imprecise, vague or missing terminology__ - Programming language lingos favor terms like "object", "property", "array", "array index", "array element", usually without providing a theoretical basis for their existence, hence introducing some level of confusion and misunderstanding of the actual matter. As a solution, Trancribe Protocol v1.0 builds a model describing graph transcription-related phenomena via a set of formal definitions based on graph and set theories (see below).

- __Conflicting requirements related to algorithm complexity and performance__ - Well performing implementations tend to require much longer development times, while also offering more cryptic APIs; on the other hand, late optimization often introduces breaking API changes, which, when postponed, has the potential to trigger massive rewriting efforts, putting developers and product owners in a position to choose between bad performance and unreasonably high development costs. Trancribe Protocol v1.0 facilitates critical early optimization planning by preemptively defining possible challenges and offering solutions.

- __Lack of modularity and code isolation due to mising or unclear conepts__ - Having a well-defined and -tested model goes a long way with breaking the code base into functionally-independent testable units that play well with each other. Trancribe Protocol v1.0 recommends such model and defines independent and isolated _code principal_ units that peform narrowly-defined subtasks and combine into complex and configurable _transcription_ processes.

Terminology
-------------------

### Basic Terms

For basic mathematical terminology, read:

|Term|Wikipedia Link
|--|--
|graph|[Wikipedia - Graph (discrete mathematics)](https://en.wikipedia.org/wiki/Graph_(discrete_mathematics))
|vertex|[Wikipedia - Vertex (graph theory)](https://en.wikipedia.org/wiki/Vertex_(graph_theory))
|directed graph|[Wikipedia - Directed graph](https://en.wikipedia.org/wiki/Directed_graph)
|empty set|[Wikipedia - Empty set](https://en.wikipedia.org/wiki/Empty_set)
|uncountable set|[Wikipedia - Uncountable set](https://en.wikipedia.org/wiki/Uncountable_set)
|countable set|[Wikipedia - Countable set](https://en.wikipedia.org/wiki/Countable_set)
|cardinality|[Wikipedia - Cardinality](https://en.wikipedia.org/wiki/Cardinality)

### Vertex 

Trancribe Protocol v1.0 defines a _vertex_ as the fundamental unit of which a directed multigraph is formed, which can either start _arcs_ (a _composite_ _vertex_) or has an intrinsic unbreakable value (an _atomic_ _vertex_).

In JavaScript, _composite_ _vertices_ are represented as arrays, objects, dictionaries and instances of other reference types, while values of any other type constitute _atomic_ _vertices_. Although there is an apparent correspondence between the terms _composite vertex_ - _reference type_ and _atomic vertex_ - _value_ type, Trancribe Protocol v1.0 does not establish such relation and, in contrary, postulates that it's up to the concrete implementation to provide one or more alternative, precise definitions for all _vertex_ _types_ via one or more _fabric_ definitions (see below).

Here are some intuitive classification examples in JavaScript:

```javascript
const composite1 = {};
const composite2 = { a: 1 };
const composite3 = [];
const composite3 = [{ b: void 0 }];
const composite4 = new Set();
const composite5 = new Map();
const atom1 = void 0;
const atom2 = null;
const atom3 = 11;
const atom4 = "abc";
const atom5 = true;
const atom6 = new Date();
```

### Arc

An _arc_ is defined as a labeled directed pair of _vertices_. The start _vertex_, also referred to as a _tail_, must be a _composite_ _vertex_. The end _vertex_, or _head_, can be either a _composite_, an _atomic_ _vertex_ or a _void vertex_. All _arcs_ starting from the same _vertex_ form an ordered list.

_Arcs_ are represented as `(head, label, tail: arc|root)` triplets, where:

- `head` represents the end _vertex_ of the _arc_, or, in programming terms, the value;
- `label` represents either an _uncountable_ or a _countable_ _label_ of the _arc_, or, in programming terms, a property name or an array index, respectively; Trancribe Protocol v1.0 requires _labels_ to be unique within the set of all _arcs_ starting from the same _vertex_ (this requirement might be a subject of reevaluation in the future versions of the protocol).
- `tail` represents the start _vertex_ of the _arc_ and is recursively defined as an _arc_ whose _head_ is this _arc_'s _tail_ or the _root_ _vertex_; in programming terms, the _tail_ is the container (an array or an object).

__Void arc__

_Void arc_ denotes a reference to an _arc_ with no _head_ (the _head_ is a _void vertex_). Such would be the case with _target_ _arcs_ that have not been yet created, or the last _arc_ in a _graph path_. In programming terms, a _void arc_ represents an unset object property or array element.

__Composite vertex representation__

In a concrete implementation, the representation of a _composite vertex_ can be done either via a direct reference to an _array_, _object_ or another container (for Ex. the _head_ and _tail_ _vertices_ of the following _arc_ are directly referenced: `{ head: { b: 5 }, label: "a", tail: { a: { b: 5 } } }`), or indirectly via the _vertex type_ of the _composite_: _countable_ or _uncountable_ (for Ex. `{ head: Uncountable, label: "a", tail: Uncountable }`, where `Uncountable` is an externally defined symbol). The first representation bears some potentially unwanted redundancy, violates data immutability by exposing the _source_ vertices for modification, and might require additional _vertex type_ checks to be performed on usage, while the second one has no such drawbacks and therefore is recommended for implementation.

In JavaScript, an inefficient but illustrative notation of _arcs_ featuring direct _vertex_ referncing would be:

```javascript
const compositeRoot = { a: [5] };
const rootedArc =
{
    head: compositeRoot.a,
    label: "a",
    tail: compositeRoot,
};
const atomicArc =
{
    head: 5,
    label: 0,
    tail: rootedArc,
};
const voidArc =
{
    label: 1,
    tail: rootedArc,
};
```

### Vertex Cardinality

The term _vertex cardinality_ reflects the cardinality of the set of all possible _arcs_ that can start from a _vertex_. Trancribe Protocol v1.0 recognizes three _vertex cardinalities_:

- _zero_ - measured when the set of all possible _arcs_ that can start from the _vertex_ is the empty set; a _vertex_ with _cardinality_ of _zero_ is refered to as an _atom_ or _atomic_ _vertex_; in programming, such _vertices_ are usually formed from value types (`void 0`, `null`, `3.142856`, `"string"`, `new Date()`);
- _aleph-null_ - measured when the set of all possible _arcs_ that can start from the _vertex_ has cardinality of aleph-null and is therefore _countable_; a _vertex_ with _cardinality_ of _aleph-null_ is refered to as a _countable composite_ or _countable_ _vertex_; in programming, such _vertices_ are usually formed from arrays (`[]`, `[1, 2, 3]`, `[null, "a", {}]`);
- _aleph-one_ - measured when the set of all possible _arcs_ that can start from the _vertex_ has cardinality of aleph-one and is therefore _uncountable_ \*; a _vertex_ with _cardinality_ of _aleph-one_ is refered to as an _uncountable composite_ or _uncountable_ _vertex_; in programming, such _vertices_ are usually formed from dictionaries/objects (`{}`, `{ a: 1 }`, `new Set()`, `new Map()`);

_\* Although, in practice, due to hardware limitations the set of all possible dictionary keys is always finite, theoretically an infinite number of dictionary keys exists. The cardinality of such set is considered to be aleph-one because it can be built the same way as the set of all real numbers - in a dictionary with lexically comparable string keys of theoretically unlimited length, for every lexically-ordered string pair it is always possible to form a new string that is lexically positioned between the two by appending a character at the end of the first string._

*NOTE: In JavaScript (and a bulk of other programming languages), it's possible to combine arcs with countable and uncountable labels starting from the same vertex. Transcribe Protocol v1.0 recommends that vertices capable of starting countable arcs be considered of cardinality aleph-null and all uncountable arcs starting from such vertices be ignored. Failing to do so introduces a new layer of complexity, both theoretically (it's not immediately clear how a hybrid vertex could be represented in all graph path/cursor forms and encodings) and practically (handling hybrid vertices comes at an increased computation cost, and it's not immediately clear how to mitigate negative performance effects). This topic shall be revisited and by the next versions of Transcribe Protocol.*

### Vertex Type

_Vertex types_ are defined by Trancribe Protocol v1.0 based on the _cardinality_ of a _vertex_.

- _atom_ - designates a _vertex_ with _cardinality_ of _zero_; in JavaScript that would be any non-object, non-array value (for Ex. `void 0`, `15`, `"abc"`, `new Date()`; depending on the implementation, class instances, functions and other controversial artifacts might be considered _atoms_ as well).
- _composite_ - designates a _vertex_ with _cardinality_ of _aleph-null_ or _aleph-one_; in JavaScript that would be an _array_, an _object_ instance and, depending on the implementation, instance of any other reference type.
- _countable_ - designates a _vertex_ with _cardinality_ of _aleph-null_; in JavaScript that would be an _array_.
- _uncountable_ - designates a _vertex_ with _cardinality_ of _aleph-one_; in JavaScript that would be an _object_ instance and, depending on the implementation, an instance of any other reference type.
- _void_ - designates a _void vertex_, see next.

__Void vertex (void)__

A _void vertex_ is defined as the _head_ of a _void arc_, or in programming terms - an unset property/array element. Also, in this documentation referred to simply as _void_.

### Label Type

_Label type_ represents the countability of the label's value set.

- _countable label_ - A label from a countable value set (a non-negative integer in JavaScript); _countable labels_ are only applicable to _arcs_ starting from _countable composites_; in programming a _countable label_ is usually referred to as an _array index_.
- _uncountable label_ - A label from an uncountable value set (a string in JavaScript, but also a `Symbol` or any other plausible dictionary key); _uncountable labels_ are only applicable to _arcs_ starting from _uncountable composites_; in programming an _uncountable label_ is usually refered to as a _property name_ or a _dictionary key_.

Transcription
-------------------

_Transcription_ is the multistep act of creating, modifying, destroying or preserving intact a _target_ graph by adding, replacing, removing and preserving _target_ graph's vertices and edges, based on the traversal of a _source_ graph performed by a _walker_, a transformation decision-making process outsourced to one or more _translators_ and writing to the _target_ graph using a _constructor_.

### Graph Roles

Trancribe Protocol v1.0 defines the following _graph roles_:

- _source_ - an input directed multigraph;
- _target_ - an existing or yet-to-be-created output graph into which the _source_ is being transcribed.

### Root

_Root_ designates a _source_ or _target_ graph vertex designated as a starting point for traversal/constructing (a _composite_, an _atom_ or _void_; transcribing a _void source root_ unconditionally yields the unmodified _target_).

### Code Principals

_Code principal_ designates a functionally-distinctive part of the code encapuslated behind a clearly defined interface.

- _fabric_ - Code responsible for making distinction between _void_, an _atom_, a _countable composite_ and an _uncountable composite_. A _fabric_ might be extended with creation of new _composite_ vertices and _walker_ implementations.
- _walker_ - Code that performs graph traversal and visits in a well-defined order the _source_ graph's _root_ _vertex_ and _arcs_, providing a _visitor_ with its findings either as graph artifacts (_vertices_, _arcs_), _cursor movements_ within the _source_ graph, or in other way selected by the implementation.
- _visitor_ - A function or a set of functions invoked by a _walker_ or a _translator_ for each of its finding.
	- _translator_ - A _visitor_ designed to analyse the findings made by a _walker_ or another _translator_ and to provide its own findings to another _visitor_.
	- _constructor_ - A _visitor_ that knows how to create and/or modify a graph based on a _walker_'s or _translator_'s findings.

The transcription process is initiated by a _walker_, findings are passed to a chain of _translators_ and eventually delivered in a translated form to a _constructor_. The _walker_ knows how to exhaustively traverse a directed multigraph and visit every _arc_ in the _source_ graph exactly one time per walk. The _translator_ knows how to analyse the findings of a _walker_ or another _translator_ and feed those findings to the next _visitor_ in the chain. The _constructor_ knows how to create a new or modify an existing _target_ graph based on a _walker_'s/_translator_'s findings. The _fabric_ (see next) is responsible for making distinction between _void_, an _atom_, a _countable composite_ and an _uncountable composite_.

### Fabric

The code responsible for making distinction between _void_, an _atom_, a _countable composite_ and an _uncountable composite_ is referred to as _fabric_. A single Trancribe Protocol v1.0 implementation can provide multiple alternative _fabrics_ depending on the specific programming needs. For Ex., a JavaScript implementation could define a fabric that recognizes functions as _atoms_ and another that recognizes functions as _composites_. Depending on the usage scenario either one could be of value.

A complete _fabric_ implementation should be capable of:

- recognize _void_ based on given _tail vertex_ and _label_;
- recognize an _atomic vertex_;
- recognize a _countable vertex_;
- recognize an _uncountable vertex_;
- recognize a _countable label_;
- recognize an _uncountable label_;
- create a new _countable vertex_, optionally with a given initial arc count;
- create a new _uncountable vertex_;
- create a new _composite vertex_ that is _coherent_ (see _vertex coherence_ below) with a given _cardinality_;
- walk a graph (provide a _walker_ function); implementing _fabric_-specific _walkers_ becomes the natural choice when _fabric_-specific performance optimization is considered.

Trancribe Protocol v1.0 recommends that _translators_ and _constructors_ use a configurable _fabric_ instance to perform all above-listed operations.

__Fabric optimization__

Given that all _fabric_ operations (consisting mainly of type checks and value comparisons) except for the `walker` are expected to have execution times comparable to the rest of the operations performed during graph _traversal_, _translation_ and _construction_ (consisting mainly of value comparisons, property/array element accessors and value assignments) and thus will have measurable impact on performance, it's crucial to reduce both their compexity and number of invokations. Good practices would be:

- for _vertex type_ management, implement a `getVertexCardinality` function, instead of multiple `is*` functions like `isAtom, isCountable, isUncountable`, then call `getVertexCardinality` only once per vertex and pass the result to _visitors_ along with the value;
- for _label type_ management, let the _walker_ code infer _label type_ from the _vertex type_ during the iteration of the  _arcs_ of a _comspoite vertex_ and pass it to _visitors_ along with the _label_, skipping calls to _fabric_ methods whatsoever;
- instead of assuming, thoroughly and continuously test and retest the performance impact of every _fabric_ implementation in standalone performance tests and in combination with emerging _translator_ and _constructor_ implementations.

### Vertex Coherence

_Vertex coherence_ designates the fact of two _vertices_ being of the same _composite vertex type_ or both being _atomic_, or both being _void_. For Ex., in JavaScript, the _vertex_ pairs `([], [125, "a", true])`, `({}, {})`, `({t:5}, {})`, `(5, 6)`, `(void 0, "a")`, `(unset, unset)` are usually considered _coherent_, while the _vertex_ pairs `({}, [125, "a", true])`, `([], {})`, `(5, [])`, `(void 0, {}), (void 0, unset)` are not (`unset` would be an externally-defined symbol designating the _void vertex_). *Note that in the above examples the JavaScript `void 0` is not considered to be a void vertex and instead represents a valid property value (e.g. `a = {}; a.b = void 0; Object.prototype.hasOwnProperty("b") === true`).*

### Tail-Label Coherence

_Tail-Label coherence_ designates the fact of matching of the _tail_'s and _label_'s cardinalities, i.e. _countable_ _tails_ are only considered _coherent_ with _countable labels_ and _uncountable_ _tails_ with _uncountable labels_; all other combinations are considered _incoherent_.

_Vertex coherence_ and _tail-label coherence_ are _visitor_ concepts used to detect conflicts between _vertices_ and _arcs_ in an existing _target_ graph and the _visitor's_ interpretation of _walker_'s/source _translator_'s findings.

Graph Traversal
-------------------

Conveying _walker_'s findings during graph traversal requires a clear and efficient way of defining and representing traversal movements and the current location in the _source_ graph. To address this requirement, Trancribe Protocol v1.0 defines the following terms:

- _graph path_ - `Unset` or a rooted chain of _arcs_ ending with a _void arc_, unambiguously identifying the location of a graph _vertex_ within the graph relative to the _root_; `Unset` designates a void _graph path_ (see below);
- _graph path encoding_ - a representation of a _graph path_ in the native code of the programming platform; multiple _graph path encodings_ are usually implemented (see _Void Graph Path and Cursor_ below);
- _graph path notation_ - a serialization sytnax for _graph paths_;
	- _dot-sharp notation_ - the default _graph path notation_ defined by Trancribe Protocol v1.0 as standard (see below for syntax definition);
- _graph cursor_ - `Unset` or a `(vertex, path)` pair; unlike a _graph path_, the _graph cursor_ **does** include the _vertex_ it's pointing at (the inner-most _arc_ is non-_void_).;`Unset` designates a void _graph cursor_ (see _Void Graph Path and Cursor_ below);
- _graph path form_ - the specific way a _procedural graph path_ or a _formal graph path_ is represented via the procedural facilities of the programming language (see below);
- _graph cursor form_ - designates the _graph path form_ of the _graph path_ component of the _graph cursor_, and specifies how the _vertex_ it's pointing at is provided (see below);
- _graph path/cursor format_ - designates a combination of a _graph path encoding_ and _graph path form_ (e.g. "lean procedural", or "lean" for short; "compact formal");
- _differential_ - an atomic movement operation during graph traversal (see below); a _differential_ can be applied on a _graph path_ producing a new, modified _graph path_;
- _delta_ - a list of _differentials_ representing the difference between two _graph paths_ (a left-hand and a right-hand _graph path_); applying in order a _delta_'s _differentials_ on the left-hand _graph path_ produces the right-hand _graph path_.

### Graph Path

_Graph path_ designates a rooted chain of _arcs_ (a list of _arcs_ with the first _arc_'s _tail_ being the _root_ and every next _arc_'s _tail_ referencing the previous _arc_'s _head_) unambiguously identifying the location of a graph _vertex_ within the graph relative to the _root_. A _graph path_ identifies exactly one _vertex_. Multiple different _graph paths_ can exist that identify the same graph _vertex_, each _graph path_ following a different route from the _root_ to the _vertex_ within the graph.

The _graph path_ does not include the _vertex_ it's pointing at. Therefore, the last _arc_ in a _path_ is always a _void arc_. The _arc_'s _head_ might be then supplied in an auxialary way by the _code principal_ that is providing the path, e.g. in a _graph cursor_.

### Graph Path Encoding

_Graph path encoding_ designates the way a _graph path_ is represented by the coding facilities provided by the programming platform.

Trancribe Protocol v1.0 defines three _graph path encodings_:

__Procedural Graph Path__

_Graph paths_ that are described in a program via the procedural facilities of the programming language are referred to by Transcribe Protocol 1.0 as _procedural graph paths_. Examples of _procedural graph paths_ written in JavaScript would be (for details, see the "Graph Cursor and Graph Path/Cursor Forms" section below):

- _Verbose form_ of a _procedural graph path_ - `[<root>, { head: <head>, label: <label>, tail: <tail> }, { head: <head>, label: <label>, tail: <tail> }, ... { label: <label>, tail: <tail> }]`;
- _Explicit form_ of a _procedural graph path_ - `[<root>, null, <head>, <label>, ... <head>, <label>, null, <label>]`;
- _Lean form_ of a _procedural graph path_ - `[<composite vertex type of the root>, null, <composite vertex type>, <label>, ... <composite vertex type>, <label>, null, <label>]`;
- _Compact form_ of a _procedural graph path_ - `[<label>, <label>, <label>, ...]`.

__Graph Path Expression__

In contrast, _graph paths_ that are described as formatted strings and/or other literals using a _graph path notation_ are referred to as _graph path expressions_. Examples of _graph path expressions_ written with different notations would be (see also the _Graph Path Notation_ section below):

- JavaScript accessor notation: `"a.b[0].c"`;
- XPath notation: `"/a/b/c"`;
- mongodb dot notation: `"a.b"`;
- dot-sharp notation: `"a.b#0.c"`, `0`, `null`;
- Unix path notation: `/a/b/c`.

__Formal Graph Path__

A _formal graph path_ is a combination of a _procedural graph path_ with _graph path expressions_:

- `["a", "b#0", "c"]`;
- `["a.b", 0, "c"]`;
- `["a.b#0.c"]`.

In the above _formal graph path_ samples, all _uncountable labels_ are treated as _graph path expressions_, which contrasts with the _uncountable label_ treatment in _procedural graph paths_ - as a literal.

The choice of a _graph path encoding_ depends of the task at hand; mature Transcribe Protocol 1.0 implementations are expected to support all three _graph path encodings_ and offer translation between them.

### Graph Path Notation

_Graphs_ and _graph paths_ are often manually created and manipulated by humans instead of being automatically constructed by computers (the reason why formats such as YAML, JSON and XML/XPath have been conceived). Trancribe Protocol 1.0 designates _graph paths_ that are written in a human-friendly form as _graph path expressions_, as opposed to _procedural graph paths_ (see above), whereas the term _graph path notation_ denotes the syntax/schema of such human-readable formats.

Examples of well-known _graph path notations_ are:

- JavaScript's property/array element accessor syntax (e.g. `a.b[0].c`);
- XPath - XML comes along with XPath, which among its other functions offers a _graph path_ human-readable notation (see https://www.tutorialspoint.com/xpath/xpath_absolute_path.htm);
- mongodb's dot notation (see https://www.mongodb.com/docs/manual/core/document/#dot-notation).

__Graph Path Inlining__

_Graph path inlining_ facilitates mixing of _procedural graph paths_ with _graph path expressions_ into _formal graph paths_. Consider the following ways of expressing the same _graph path_:

```JavaScript
const obj = { "a.a": { b: [{ c: 5 }] } }; 

const compactPathTo5 = ["a.a", "b", 0, "c"];						//	by default, procedural graph paths treat uncountable labels as literals
const dotSharpPathTo5 = "a\.a.b#0.c";								//	the dot-sharp notation requires dots, sharps and back-slashes to be escaped via `\`
const formalCompactAndDotSharpPathTo5_1 = ["a\.a", "b#0.c"];		//	all uncountable labels in a formal path representation are treated as inlined graph path expressions
const formalCompactAndDotSharpPathTo5_2 = ["a\.a", "b", 0, "c"];	//	all uncountable labels in a formal path representation are treated as inlined graph path expressions
const formalCompactAndDotSharpPathTo5_3 = ["a\.a.b#0.c"];			//	all uncountable labels in a formal path representation are treated as inlined graph path expressions
```

###  The Dot-Sharp Notation

Trancribe Protocol v1.0 defines the _dot-sharp notation_ as a protocol standard for graph path encoding.

The _dot-sharp notation_ encodes graph paths as one of the following: a string, an integer or `null`. As a result _dot-sharp_-encoded paths must be stored outside JavaScript code or JSON with indication of the literal type, such as double quotes for a string - consider the _dot-sharp_-encoded paths `0` (path is `[0]`, or equivalent to `"#0"` - one countable label `0`) and `"0"` (path is `["0"]` - oneun countable label `"0"`).

NOTE: Despite the sound of its name, the _dot-sharp notation_ is not directly related neither to .NET, nor to C#. Its name is inferred from the two characters used by the notation for structural purposes: the dot `.`, which prefixes _uncountable labels_ and the sharp `#`, which prefixes _countable labels_.

__Significant characters__

|Character|Description|Sample
|--|--|--
|`.`|Prefixes uncountable labels; if the first _label_ in the _path_ is _uncountable_, the leading dot `.` character is ommitted.|`a.b.c`
|`#`|Prefixes countable labels; if the first _label_ in the _path_ is _countable_, the leading sharp `#` character is preserved.|`#0#1#2`
|`\ `|Escape character; dots `.`, sharps `#` and back-slashes `\ ` in _uncountable labels_ must be escaped via the escape character.|`a.\a\#\\0` (encodes the _uncountable label_ `"a.a#\0"`)

__Escape sequences__

|Escape sequence|Description
|--|--
|`\. `|Decoded as the dot `.` character.
|`\# `|Decoded as the sharp `#` character.
|`\\ `|Decoded as the back-slash `\ ` character.
|`\<any other character>`|Decoded as the character following the back-slash `\ `, except for some of the special cases listed below.

__Label special cases__

|Case|Decoded as
|--|--
|`""`|Decoded as the empty `""` label.
|`"\\0"` (a string containing the slash character followed by the zero `'0'` character)|Decoded as the empty `""` label.
|`"."`|Decoded as the `"."` label (a label containing one dot `.` character).
|`"#"`|Decoded as the `"#"` label (a label containing one sharp `#` character).
|`"\\"` (a string containing one slash character)|Decoded as the `"\\"` label (a label containing one slash `\ ` character).
|`<integer>`|Decoded as a single countable label.

__Path special cases__

|Case|Parsed as
|--|--
|`null`|Parsed as the empty `[]` compact path.
|`""`|Parsed as the `[""]` compact path.
|`"\\0"` (a string containing the slash character followed by the zero `'0'` character)|Parsed as the `[""]` compact path.
|`"."`|Parsed as the `["", ""]` compact path (two empty-string labels).
|`"#"`|Parsed as the `["#"]` compact path (one label containing one sharp `#` character).
|`"\\"` (a string containing one slash character)|Parsed as the `["\\"]` compact path (one label containing one slash `\ ` character).
|`"\\0#<integer>"`|Parsed as the `["", <integer>]` compact path (one empty-string label, one integer label).
|`<integer>`|Parsed as the `[<integer>]` compact path (one countable `<integer>` label).

### Void Graph Path and Cursor

The _void graph path_ and _void graph cursor_ point to nothing and prepresent a _walkler_'s/_visitor_'s state before the _root_ has been visited, or after all graph _vertices_ have been visted. Depending on the concrete implementation and the _graph path_ or _graph cursor_ _form_ of choice, a _void graph path_/_void graph cursor_ can be represented by `null`, `void 0`, via an auxilliary flag, via a symbol dedicated for representing unset variables, object properties or array elements, such as `const Unset = Symbol("Unset")` etc. Trancribe Protocol v1.0 recommends using a dedicated `Unset` symbol if possible.

### The Concept of Non-Existence

Graph _transcription_ needs to consider all possible _atomic_ values that can be used as a _vertex_ by the programming platform. The default representation of the concept for non-existence, usually in the form a dedicated value (`void 0` in JavaScript, `NULL` in C, `null` in C# etc.), might be unsuitable for representing the same concept from the _transcription_ process's point of view, because such values might need to be recognized as _atoms_ for _walkers_ to be able to unambiguously convey their findings to _visitors_.

As a possible solution, a function call might be offered by a _fabric_ to recognize _void arcs_, similarly to the JavaScript's `Object.prototype.hasOwnProperty.call(container, propertyKey)` approach (e.g. `fabric.arcExists(tail, label)`). If the programming language offers the symbol construct, a new symbol might be defined to indicate non-existance of _vertices_, especially for specifying non-existent/unset _source_ and _target_ graph _roots_, thus allowing `void 0`, `NULL`, `null` etc. to be treated as _atomic root vertices_ rather than as being unset, and letting _visitor_ implementations decide how to handle such situations.

### Graph Cursor and Graph Path/Cursor Forms

_Graph cursor_ designates `Unset` (a void cursor) or a `(head, path)` pair. Unlike a _graph path_, a non-_void_ _graph cursor_ **does** include the _graph cursor head_ it's pointing at.

_Graph cursor head_ can refer to any value, including `Unset`. When used as a _graph cursor head_ value, `Unset` is interpreted as a regular symbol value and does not bear any further significance. _Graph construction_ (see below) defines a set of significant _graph cursor head_ symbol values that it uses as merging commands.

Depending on the requirements of the concrete implementation, multiple _forms_ of _graph path_ and _graph cursor_ are conceivable:

_NOTE: In the followig tables `Unset` stands for the void graph path or the void graph cursor representation in the concrete programming language used for implementation, e.g. `const Unset = Symbol("Unset")` in JavaScript (see the "Void Graph Path and Cursor" section)._

_NOTE: In the followig tables `<instruction>` stands for the `Delete` significant graph cursor head symbol (see the "Merging a Graph Cursor into a Graph" section below)._

__Verbose__

_Graph Path_ (`length == 0 || length > 1`)

|Case|Representation
|--|--
|Void path|`Unset`
|Head is root|`[]`
|Minimal Non-Root|`[<root>, { label: <label>, tail: <tail> }]`
|Other|`[<root>, { head: <head>, label: <label>, tail: <tail> }, { head: <head>, label: <label>, tail: <tail> }, ... { label: <label>, tail: <tail> }]`

_Graph Cursor_ (`length > 0`)

|Case|Representation
|--|--
|Void cursor|`Unset`
|Head is atomic root|`[<root>]`
|Head is composite root|`[<root>]`
|Minimal Non-Root|`[<root>, { head: <head>, label: <label>, tail: <tail> }]`
|Atomic head|`[<root>, { head: <head>, label: <label>, tail: <tail> }, { head: <head>, label: <label>, tail: <tail> }, ... { head: <head>, label: <label>, tail: <tail> }]`
|Composite head|`[<root>, { head: <head>, label: <label>, tail: <tail> }, { head: <head>, label: <label>, tail: <tail> }, ... { head: <head>, label: <label>, tail: <tail> }]`
|Instruction head|`[<root>, { head: <head>, label: <label>, tail: <tail> }, { head: <head>, label: <label>, tail: <tail> }, ... { head: <instruction>, label: <label>, tail: <tail> }]`

This _form_ is the highly readable but implies potentially unnecessary memory allocation, bears some potentially unwanted redundancy, violates data immutability by exposing the _source_ vertices for modification, and might require additional _vertex type_ checks on usage. The last _arc_ of a _graph path_ is a _void arc_. Best fitted for illustrative and diagnostic purposes.

__Explicit__ (`length == 0 || length > 3`)

|Case|Representation
|--|--
|Void path|`Unset`
|Head is root|`[]`
|Minimal Non-Root|`[<root>, null, null, <label>]`
|Other|`[<root>, null, <head>, <label>, ... <head>, <label>, null, <label>]`

_Graph Cursor_ (`length == 1 || length > 3`)

|Case|Representation
|--|--
|Void cursor|`Unset`
|Head is atomic root|`[<root>]`
|Head is composite root|`[<root>]`
|Minimal Non-Root|`[<root>, null, <head>, <label>]`
|Atomic head|`[<root>, null, <head>, <label>, ... <head>, <label>, <head>, <label>]`
|Composite head|`[<root>, null, <head>, <label>, ... <head>, <label>, <head>, <label>]`
|Instruction head|`[<root>, null, <head>, <label>, ... <head>, <label>, <instruction>, <label>]`

_Arc tails_ are not explicitly marked in the list while being still present in the form of the _head_ of the left-standing _arc_. The last _arc_ of a _graph path_ is a _void arc_. The second and fore-last list elements of a _graph path_ are always set to `null` to aid iteration (the left `null` value stands where the _label_ of an _arc_ ending with the _root_ would be if such _label_ was applicable to the _root_; the right `null` value stands where the _vertex_ the _graph path_ is pointing at would be if _graph paths_ were designed to carry such information).

This _form_ bears some potentially unwanted redundancy, violates data immutability by exposing the _source_ vertices for modification, and might require additional _vertex type_ checks on usage. This _graph path/cursor form_ is an excellent fit for real-world implementations of the _cursor list_ condensing\* and exhausting\*.

\* _See below for details on common operations on graphs and graph paths/cursors._

__Lean__

_Graph Path_ (`length == 0 || length > 3`)

|Case|Representation
|--|--
|Void path|`Unset`
|Head is root|`[]`
|Minimal Non-Root|`[<composite vertex type of the root>, null, null, <label>]`
|Other|`[<composite vertex type of the root>, null, <composite vertex type>, <label>, ... <composite vertex type>, <label>, null, <label>]`

_Graph Cursor_ (`length == 1 || length > 3`)

|Case|Representation
|--|--
|Void cursor|`Unset`
|Head is atomic root|`[<atomic root>]`
|Head is composite root|`[<composite vertex type of the root>]`
|Minimal Non-Root|`[<composite vertex type of the root>, null, <head>, <label>]`
|Atomic head|`[<composite vertex type of the root>, null, <composite vertex type>, <label>, ... <composite vertex type>, <label>, <head>, <label>]`
|Composite head|`[<composite vertex type of the root>, null, <composite vertex type>, <label>, ... <composite vertex type>, <label>, <composite head type>, <label>]`
|Instruction head|`[<composite vertex type of the root>, null, <composite vertex type>, <label>, ... <composite vertex type>, <label>, <instruction>, <label>]`

_Arc tails_ are not explicitly marked in the list while being still present in the form of the _head_ of the left-standing _arc_. The last _arc_ of a _graph path_ is a _void arc_. The second and fore-last list elements of a _graph path_ are always set to `null` to aid iteration (the left `null` value stands where the _label_ of an _arc_ ending with the _root_ would be if such _label_ was applicable to the _root_; the right `null` value stands where the _vertex_ the _graph path_ is pointing at would be if _graph paths_ were designed to carry such information).

Although bearing some redundancy (all _composite vertex types_ can be inferred from the next _arc_'s _label type_ and thus are not required to be explicitly specified), this _form_ might be useful in scenarios where _label type_ examination by the _fabric_ cannot be inlined and requires additional function calls, whereas the _composite vertex type_ is readily available without further computation to the _code principal_ maintaining the _graph path/cursor_; in such scenarios the redundancy is used as a caching mechanism. On the other hand, iterating through the _lean form_ requires twice as many operations compared to the _compact form_, which might have impact on performance. The final choise of the _form_ shall be based on performance tests.

Some real-life tests with v8 (Google's JavaScript engine) have demonstrated that among compact and lean forms, this is the best performing _graph path/cursor form_ in terms of graph walking and construction.

On the negative side, the redundancy (_label_- and _tail_ representations duplicate the _cardinality_ information) opens the possibility for creating invalid cursors and might as well add considerable complexity to the implementation of some operations, e.g. _graph path/cursor_ rotation\* (https://en.wikipedia.org/wiki/Left_rotation).

This _graph path/cursor form_ is an excellent fit for real-world implementations of most _graph_ operations like _graph_ filtering\*, cloning\* and serialization\*. Yet, there are some operations such as _graph path/cursor_ and _graph_ inflation\*, deflation\* and rotation\*, as well _graph path/cursor_ list serialization/deserialization, which fit best with the last of the _graph path/cursor forms_: the _compact form_.

\* _See below for details on common operations on graphs and graph paths/cursors._

__Compact__

_Graph Path_ (n/a)

|Case|Representation
|--|--
|Void path|`Unset`
|Head is root|`[]`
|Minimal Non-Root|`[<label>]`
|Other|`[<label>, <label>, <label>, ...]`

_Graph Cursor_ (`length > 0`)

|Case|Representation
|--|--
|Void cursor|`Unset`
|Head is atomic root|`[<atomic root>]`
|Head is composite root|`[<composite vertex type of the root>]`
|Minimal Non-Root|`[<head>, <label>]`
|Atomic head|`[<head>, <label>, <label>, <label>, ...]`
|Composite head|`[<composite head type>, <label>, <label>, <label>, ...]`
|Instruction head|`[<instruction>, <label>, <label>, <label>, ...]`

The _compact_ _graph cursor form_ encodes the same information as the other _forms_: `[<atomic head | composite head type>, <label1>, <label2>, ... <labelN>]` is pointing at an _atomic_ or _composite vertex_ away from the _root_, with _root_'s _composite type_ inferrable by _coherence_ from the _label type_ of `<label1>`, the _composite type_ of the _head_ of the first _arc_ in the _cursor_ inferrable by _coherence_ from the _label type_ of `<label2>` etc., until `<labelN>`, which infers the _composite type_ of the _tail_ of the _vertex_ being pointed to by the _cursor_. The _atomic_ value or the _vertex type_ of the _vertex_ being pointed to by the _cursor_ is then available from the first element of the array `<atomic head | composite head type>`.

This _graph path/cursor form_ is an excellent fit for the real-world implementations of _graph_ operations like _graph path/cursor_ and _graph_ inflation\*, deflation\* and rotation\*, as well _graph path/cursor_ list serialization/deserialization. 

\* _See below for details on common operations on graphs and graph paths/cursors._

### Subpaths and Subcursors

A _subpath_ designates any _graph path_ that points to a _composite_ _vertex_ that starts at least one _arc_. A _subcursor_ is a _graph cursor_ that has a _subpath_ as a _graph path_.

_TODO: provide examples_

### Cursor Lists

_TODO: create content_

### Delta and Differentials

_NOTE: The following section uses the compact path form for illustrative purposes. In practice, any other form can be used instead._

In the context of a multi-step graph _traversal_, _translation_ and _construction_, the _graph path_ pointing at a current location within the graph goes through a series of partial or full transformations, and a _delta_ can be computed by comparing two subsequent _graph paths_. Any _delta_ can be represented as a list of one or more _differentials_:

__Differential__

|Full|Partial|Description
|--|--|--
|`identity()`|`identity()`|The left-hand and right-hand _graph paths_ are identical. Cannot be combined with other _differentials_.
|`root()`|`root()`|The left comparison operand is the _void graph path_ and the right-hand _graph path_ is pointing at the _root_. Cannot be combined with other _differentials_. _Deltas_ of _graph paths_ sharing only the _root_ vertex must be represented via multiple `out()` and `in()` rather than via one _root()_ and multiple `in()` _differentials_.
|`unroot()`|`unroot()`|The left comparison operand is pointing at the _root_ and the right-hand _graph path_ is the _void graph path_.
|`in(label)`|`in(label)`|The **right-hand** _graph path_ ends with one additional _arc_ labeled with `label`.
|`out(label)`|`out()`|The **left-hand** _graph path_ ends with one additional _arc_ labeled with `label` (`label` might be irrelevant, hence the partial notation).

In the context of such graph traversal that implies single-step inward and multi-step outward cursor movements, and in case the specifics related to the left-side of the comparison are irrelevant, an alternative and more efficient way to record _deltas_ is possible through a single _differential_: `identity | root | branch(outCount, inLabel | null)`. In this notation, multiple `out` _differentials_ are encoded as `outCount`, and the `unroot` _differential_ is represented by `branch(N, null)`, where `N` is the length of the _graph path_ + 1 (an `N` equal to the _graph path_'s length indicates a right-hand _graph path_ of length 0, i.e. pointing at the _root_, rather than a _void path_).

_Differentials_ are used to build _deltas_ and instructions for _graph path_ transformations and to represent graph traversal movements:

__Delta__

|Graph traversal movement\*|Differentials|Description
|--|--|--
|`root()`|`root()`|Position the _graph path_ at the _root_. Performed only once as the first graph traversal movement when the _walker_ visits the _root_ at the beginning of the traversal.
|`unroot()`|`unroot()`|Position the _graph path_ at the virtual, non-existent _root_'s _tail vertex_. Performed only once as a last graph traversal movement during graph traversal.
|`in(label)`|`in(label)`|Move the _graph path_ one level away from the _root_.
|`side(label)`|`out(), in(label)`|Move the _graph path_ to the next _arc_ starting from the same _vertex_ following the _arc_ list order.
|`out(delta)`|`delta`-times `out()`|Move the _graph path_ `delta` levels towards the _root_. This is the movement following the visit of the last _arc_ of a vertex (`delta === 1`) or of a chain of vertices `delta >= 2`.

\* Characteristic to [depth-first pre-order](https://en.wikipedia.org/wiki/Depth-first_search) traversals; other traversal algorithms might need a different set of graph traversal movements to be defined.

### Delta Walker - The Stalker Protocol

A _delta walker_ is a _walker_ informing the _visitor_ about _deltas_, instead of maintaining and passing along _graph cursors_, this way letting the _visitor_ "stalk" their every movement. _Delta walker_ implementations have the potential to provide a universal single-function-_visitor_ interface and perform extremely well while allowing _visitors_ to build and maintain _graph cursors_ only when needed.

On the negative side, writing _visitors_ for the _stalker protocol_ is non-trivial and might require additional development time.

_TODO: code samples_

Graph Encoding
-------------------

Trancribe Protocol v1.0 defines _graph encoding_ as the set of programming facilities used to represent a graph in-memory or in a serialized form. The following _graph encodings_ are formally recognized:

- native (binary) - this is the native form used by the programming platform to represent a graph; in JavaScript that would be an object/array in-memory tree;
- formal (binary) - _native graph encoding_ with _graph path inlining_; _uncountable labels_ are treated as _graph path expressions_;
	- dictionary - the _dictionary graph encoding_ is an edge case of the _formal graph encoding_ with all _graph cursors_ represented as pairs of a _graph path expression_ and a _head_;
- list (binary) - _graphs_ are represented as lists of _graph cursors_; the _list graph encoding_ offers a great diversity in terms of _graph path encodings_ and redundancy (all four _graph path forms_ can be used, encoded with any one of the _graph path encodings_; in a minimalistic scenario, a list of only _graph cursors_ poiting at _atoms_ or empty _composites_ is sufficient to describe exhaustively the _graph_; _graph cursors_ poiting at non-empty _composites_ can be included when redundancy is needed).

Although graph serialization is also considered a _graph encoding_ (textual), it's not recognized as significant by Trancribe Protocol v1.0 and is not covered by this document.

As a concept illustration, consider the following _graph encoding_ samples:

```JavaScript
const graph =
{
	a: { b: 1 },
    c: [null]
};
//	w/o list redundancy
const formal =
{
	a: { b: 1 },
	"c#0": null,
};
const compactCursorList =
[
	[1, "a", "b"],
	[null, "c"],
];
const formalCursorList =
[
	[1, "a".b"],
	[null, "c"],
];
const verboseCursorList =
[
	[graph, {head: graph.a, label: "a", tail: graph}, {head: 1, label: "b", tail: graph.a}],
	[graph, {head: graph.c, label: "c", tail: graph}, {head: null, label: 0, tail: graph.c}],
];
const dictionary =
{
	"a.b": 1,
	"c#0": null,
};
//	with list redundancy
const exhaustedExtendedCursorList =
[
	[graph],
	[graph, {head: graph.a, label: "a", tail: graph}],
	[graph, {head: graph.a, label: "a", tail: graph}, {head: 1, label: "b", tail: graph.a}],
	[graph, {head: graph.c, label: "c", tail: graph}],
	[graph, {head: graph.c, label: "c", tail: graph}, {head: null, label: 0, tail: graph.c}],
];
const explicitDictionary =
{
	"a": graph.a,
	"a.b": 1,
	"c": graph.c,
	"c#0": null,
};
```

Graph Construction
-------------------

Trancribe Protocol v1.0 defines _graph construction_ as the execution of a sequence of _CUD operations_ on a _void_- or a non-void graph _target_. If the graph _target_ is _void_ (`Unset`), a new graph is produced as a result of the construction process; if the sequence of _CUD operations_ causes the _target_ _root_ to be deleted, the _target_ graph remains unchanged and the result of the construction is the `Unset` value; otherwise the existing graph _target_ is modified. _Graph construction_ might affect both the _root_ and _arcs_ within the _target_ graph.

### CUD Operation

A CUD operation modifies the _root_ and/or the _arcs_ of an existing or newly created _target_ graph by:

- _(C)_ **C**reating a new arc;
- _(U)_ replacing (**U**pdating) the head of an existing arc;
- _(D)_ **D**eleting an existing arc.

### Merging a Graph Cursor into a Graph

Merging a _graph cursor_ into a _void_- or existing graph _target_ is done by translating the _graph cursor_ into a sequence of _CUD operations_ and executing them afterwards. The translation of a _graph cursor_ into _CUD operations_ is done by a _merging procedure_ based on the types of the _source_- and _target_ _vertices_ and _merge decisions_.

The _merging procedure_ generates _(C)_ and _(U)_ _CUD operations_ based on the structure of the graph _target_ and the _merging cursor_. 

__Deleting arcs or the targer root__

_(D)_ _CUD operations_ are generated when the _merging procedure_ encounters one of the following conditions:

- _cursor_ is `Unset` - generates a _merge plan_ containing a single _(D)_ _CUD operation_; the final merge result is `Unset`;
- _cursor_ _head_ is the significant _graph cursor head_ symbol `Delete` - generates a _(D)_ _CUD operation_, which removes the inner-most _arc_ of the _graph cursor_  from the graph _target_, if present; the corresponding `*Void` _merge policy decision_ is applied depending on the _vertex_ type being removed. Depending on the `Void*` _merge policy decisions_ and in case of a delete instruction for a non-existing _arc_ from the _target_ graph, the _merging procedure_ might or might not create new _arcs_ following the _cursor_ up to the _arc_ provided for deletion.

The `Delete` instruction **cannot** be used with root-only _cursors_; deleting a _root_ is achievable via merging the `Unset` _cursor_ into a _target_ graph, and, unlike deleting an _arc_, which modifies the _target_ graph, deleting the _root_ doesn't modify the _target_ graph but rather causes the final merge result to be reported as `Unset`.

In JavaScript, the `Delete` instruction execution on an _arc_ would be implemented via `delete array[index]` and `delete object[propertyName]` (setting an _arc_'s _head_ to `undefined` or `void 0` presents itself as a _(C)_/_(U)_ _CUD operation_, which effectively ensures the existence of the _arc_ instead of deleting it).

### Merge Decision

The following are the standard _merge decisions_ recognized by Transcribe Protocol v1.0:

- fail - generate an error and abort the _merging procedure_ without modifying the _target_;
- keep - finish the _CUD operation_ without modifying the _target_ and continue with the next _CUD operation_;
- overwrite - overwrite the _target_ _vertex_ with the merging _vertex_; this operation might result in the deletion of a subgraph from the _target_ even if no _(D)_ _CUD operation_ is specified by the _graph cursor_; if the merging _vertex_ is _countable_ or _uncountable_, the _overwrite_ decision would always result in replacing the _target_ _vertex_ with a **new empty** _countable_ or _uncountable_ _vertex_ even if the _type_ of the _target_ _vertex_ is the same as the type of the merging _vertex_, effectively destroying existing _countable_ and _uncountable_ _target_ _vertices_.

### Merging Procedure

Transcribe Protocol v1.0 defines as a standard the _Merge Policy Merging Procedure_, where _merge decisions_ are made on-the-fly on the basis of a _merge policy_ supplied as a parameter to the _merging procedure_. The default _merge policy_ is _use theirs_ as defined below.

Although the _Merge Policy Merging Procedure_ allows for very efficient implementations, it also imposes uniformity on decisions for the whole merging process, which might come as a limitation in some scenarios. Alternative approaches would be:

- Delegating _merge decisions_ to a callback function; on the positive side, this would provide a more universal interface for the _merging procedure_; on the negative side, invoking callbacks usually suffers from low performance both because of additional function call times and overhead from the callback code execution, as opposed to the _Merge Policy Merging Procedure_, which employs several simple mathematical operations to achieve the goal (usually 2-6 integer equality tests and one binary and operator);

- Implementing a custom _merging procedure_; on the positive side, such approach could achieve supreme performance; on the negative side, given the complexity of the task it could be impractical to spend too much time implementing _merging procedures_ similar to each other over and over again, except for mission-critical operations.

### Merge Policy

Transcribe Protocol v1.0 refers to a set of _merge decisions_ for a set of `(<target vertex type>, <merging vertex type>)` pairs as a _merge policy_; if the _merge policy_ covers the complete set of `(<target vertex type>, <merging vertex type>)` pairs, it's referred to as a _exhaustive merge policy_. The recommended default _exhaustive merge policy_ is _use theirs_: all 16 cases listed below provision the _overwrite_ decision, except for `(void, void)`, `(countable, countable)` and `(uncountable, uncountable)`, which provision the _keep_ decision. In addition, for cases when the merging _cursor head_ is the _Delete_ merge instruction, the _safe delete_ and _try delete_ _exhaustive merge policies_ come in handy.

During the merging of a _graph cursor_ into a _target_ graph, the following _vertex_ combinations might occur that might need explicit decisions to be made on what the merge result should be:

|Target vertex type|Merging vertex type|_Use theirs_ merge decision|_Safe delete_ merge decision|_Try-delete_ merge decision
|--|--|--|--|--
|void|void|keep|keep|keep
|void|atom|overwrite|keep|fail
|void|countable|overwrite|keep|fail
|void|uncountable|overwrite|keep|fail
|atom|void|overwrite|overwrite|overwrite
|atom|atom|overwrite|keep|fail
|atom|countable|overwrite|keep|fail
|atom|uncountable|overwrite|keep|fail
|countable|void|overwrite|overwrite|overwrite
|countable|atom|overwrite|keep|fail
|countable|countable|keep|keep|keep
|countable|uncountable|overwrite|keep|fail
|uncountable|void|overwrite|overwrite|overwrite
|uncountable|atom|overwrite|keep|fail
|uncountable|countable|overwrite|keep|fail
|uncountable|uncountable|keep|keep|keep

Custom implementations of the _merging procedure_ are possible that allow for more complex and specific _merge decisions_ to be specified or executed. Due to performance considerations, Transcribe Protocol v1.0 recommends such implementations to be custom-tailored on a case-by-case basis, in contrast to extending a default policy-based implementation with any type of plugability, e.g. outsourcing decisions to a callback function (see the __Merging Procedure__ section above).

### Practical Considerations for Implementing a Merge Procedure

__Fail__

When a fail decision has been made, the question arises of whether the _target_ graph should be returned with modifications applied prior to the fail decision or such modifications should be reverted. Several strategies are possible to resolve such situations:

- _Merge plan strategy_ - using an intermediate _merge plan_: instead of directly applying changes on the _target_ graph, the _merging procedure_ first generates a list of _merge actions_ and afterwards executes them. If the last _merge action_ in the list is `Fail()`, the _merging procedure_ might decide to skip the _merge plan_ execution step or not, depending on a parameter; or the user might build a _merge plan_ in a separate function call, test for a `Fail()` _merge action_ and decide to skip the _merge plan_ execution. Because the _merge plan_ is usually required only during its building, validation and execution (all usually being executted synchronously), a very effective optimization would be to use a static buffer to store _merge plans_ instead of allocating memory for each one. Additionally, writing unit tests for a _merge plan_ builder or debugging a _merge plan_ is presumably easier than writing unit tests for or debugging a complete _merge procedure_. Transcribe Protocol v1.0 recommends this strategy as a default strategy as being most universal compared to the others listed below.

- _Transaction strategy_ - using transactions: the user of the _merging procedure_ creates a transaction and passes is as a parameter; the _merging procedure_ then iterates through the _cursor_ and directly applies any modifications to the _target_ graph, while also recording every performed _merge action_ to the transaction with the provision for a rollback for that action; after the _merging procedure_ has finished, the user decides whether to commit or rollback the transaction. Reusing a static instance is conceivable as a possible optimization. While providing no great benefits, this approach suffers from some disadvantages: it's harder to write unit tests, and debugging a monolithic _merging procedure_ would be presumably harder. It add also complexity with the implementation of the rollback functionality.

- _mutant strategy_ - Always leave the _target_ modified after fail: this approach promises maximum performance because it skips the recording of any _merge actions_; the _mutant strategy_ should be considered in mission-critical scenarios when the graph state consistency is not important. On the other hand it suffers from some of the disadvantages of the _transaction strategy_ - harder to test and debug. Additionally, it doesn't handle the presumably more common usage scenario when the _target_ graph is required to stay unmodified if the _merging procedure_ cannot complete successfully. On the other hand it could be readily available as a subcase of the _transaction strategy_, if the _transaction strategy_ implementation is able to run also without a transaction object and in such case falls back to the _mutant strategy_ behavior.

Transcribe Protocol v1.0 covers in detail the _Merge plan strategy_ only. Transcribe Protocol v2.0 might provision recommendations on the other strategies as well.

__Merge actions__

While a _CUD operation_ represents a theoretical concept, _merge action_ defines an implementable primitive. The following table defines _merge actions_ and maps them to _CUD operation_ where applicable:

|Merge action|Target type|Arguments|CUD operation|Description
|--|--|--|--|--
|Noop|Root, VoidRoot|-|-|Indicates no change in the _target_ graph
|Noop|Arc, VoidArc|`label`|-|Indicates no change in the _target_ graph
|Fail|Root, VoidRoot|`error`|-|Indicates a failed _merging procedure_
|Fail|Arc, VoidArc|`label, error`|-|Indicates a failed _merging procedure_
|Set_NewCountable|Root|-|U|Replace an existing _target_ _root vertex_ with a new countable composite
|Set_NewCountable|VoidRoot|-|C|Create a new _target_ _root vertex_ as a new countable composite
|Set_NewCountable|Arc|`label`|U|Replace an existing _target_ _arc_ head with a new countable composite; _arc_ _label_ is indicated as `label`
|Set_NewCountable|VoidArc|`label`|C|Create a new _target_ _arc_ as a new countable composite and the specified `label` as label
|Set_NewUncountable|Root|-|U|Replace an existing _target_ _root vertex_ with a new uncountable composite
|Set_NewUncountable|VoidRoot|-|C|Create a new _target_ _root vertex_ as a new uncountable composite
|Set_NewUncountable|Arc|`label`|U|Replace an existing _target_ _arc_ head with a new uncountable composite; _arc_ _label_ is indicated as `label`
|Set_NewUncountable|VoidArc|`label`|C|Create a new _target_ _arc_ as a new uncountable composite and the specified `label` as label
|Set_Atom|Root|`value`|U|Replace an existing _target_ _root vertex_ with the provided atomic `value`
|Set_Atom|VoidRoot|`value`|C|Use the provided atomic `value` as a new _target_ _root vertex_
|Set_Atom|Arc|`label, value`|U|Replace an existing _target_ _arc_ head with the provided atomic `value`; _arc_ _label_ is indicated as `label`
|Set_Atom|VoidArc|`label, value`|C|Create a new _target_ _arc_ with the provided atomic `value` as a head and the specified `label` as label
|Delete|Root|-|D|Use `Unset` as resulting `target`
|Delete|VoidRoot|-|-|_(not applicable)_
|Delete|Arc|`label`|D|Delete an existing _target_ _vertex_
|Delete|VoidArc|`label`|-|_(not applicable)_

_NOTE: The same merge action may have different argument scheme depending on whether it's acting on a root or an arc; when executing merge actions, to determine which is the case for each action use the following rule: the first merge action in any merge plan is always acting on the root, and any other merge action is acting on arcs._

__Merging the root__

When merging a `void` (`Unset`) or non-void `vertex` into the _root_ of a graph, Transcribe Protocol v1.0 recognizes as significant the following merging cases represented as triplets `(target-root-type, cursor-root-type, merge-decision)`, and recommends a respective outcome for each one (order is significant; use the recommended outcome of the first condition to test positive):

|Target root type|Merging graph cursor's root type|Merge decision|Recommended outcome
|--|--|--|--
|any|any|fail|throw an exception, `target` is unmodified
|any|void|keep|`target` (unmodified)
|any|void|overwrite|void
|void|any|keep|void	
|any|atom|overwrite|_graph cursor_'s root (atom)
|any|countable|overwrite|a new _countable composite_ created by a _fabric_
|any|uncountable|overwrite|a new _uncountable composite_ created by a _fabric_
|any|any|any|`target` (potentially modified)

The next section expands these general rules into an exhaustive list of implementable cases complemented with all arc merging cases as well.

__Merge plan__

A sequence of _merge actions_ representing the steps of a _merging procedure_ from the _target_'s _root_ towards the _cursor_'s _head_ is designated as a _Merge plan_. Transcribe Protocol v1.0 recommends the following rules for building a _merge plan_:

Merging an `Unset` cursor (see __Merging the root__ section above):

|Target root|Cursor|Merge decision|Resulting merge action
|--|--|--|--
|`Unset`|`Unset`|VoidVoidOverwrite|`Noop()`
|`Unset`|`Unset`|VoidVoidKeep|`Noop()`
|`Unset`|`Unset`|VoidVoidFail|`Fail(VoidVoid)`
|Atom|`Unset`|AtomVoidOverwrite|`Delete()`
|Atom|`Unset`|AtomVoidKeep|`Noop()`
|Atom|`Unset`|AtomVoidFail|`Fail(AtomVoid)`
|Countable|`Unset`|CountableVoidOverwrite|`Delete()`
|Countable|`Unset`|CountableVoidKeep|`Noop()`
|Countable|`Unset`|CountableVoidFail|`Fail(CountableVoid)`
|Uncountable|`Unset`|UncountableVoidOverwrite|`Delete()`
|Uncountable|`Unset`|UncountableVoidKeep|`Noop()`
|Uncountable|`Unset`|UncountableVoidFail|`Fail(UncountableVoid)`

Merging the root vertex (see __Merging the root__ section above):

|Target root|Cursor root|Merge decision|Resulting merge action
|--|--|--|--
|`Unset`|Atom `value`|VoidAtomOverwrite|`Set_Atom(value)`
|`Unset`|Atom `value`|VoidAtomKeep|`Noop()`
|`Unset`|Atom `value`|VoidAtomFail|`Fail(VoidAtom)`
|Atom|Atom `value`|AtomAtomOverwrite|`Set_Atom(value)`
|Atom|Atom `value`|AtomAtomKeep|`Noop()`
|Atom|Atom `value`|AtomAtomFail|`Fail(AtomAtom)`
|Countable|Atom `value`|CountableAtomOverwrite|`Set_Atom(value)`
|Countable|Atom `value`|CountableAtomKeep|`Noop()`
|Countable|Atom `value`|CountableAtomFail|`Fail(CountableAtom)`
|Uncountable|Atom `value`|UncountableAtomOverwrite|`Set_Atom(value)`
|Uncountable|Atom `value`|UncountableAtomKeep|`Noop()`
|Uncountable|Atom `value`|UncountableAtomFail|`Fail(UncountableAtom)`
|`Unset`|Countable|VoidCountableOverwrite|`Set_NewCountable()`
|`Unset`|Countable|VoidCountableKeep|`Noop()`
|`Unset`|Countable|VoidCountableFail|`Fail(VoidCountable)`
|Atom|Countable|AtomCountableOverwrite|`Set_NewCountable()`
|Atom|Countable|AtomCountableKeep|`Noop()`
|Atom|Countable|AtomCountableFail|`Fail(AtomCountable)`
|Countable|Countable|CountableCountableOverwrite|`Set_NewCountable()`
|Countable|Countable|CountableCountableKeep|`Noop()`
|Countable|Countable|CountableCountableFail|`Fail(CountableCountable)`
|Uncountable|Countable|UncountableCountableOverwrite|`Set_NewCountable()`
|Uncountable|Countable|UncountableCountableKeep|`Noop()`
|Uncountable|Countable|UncountableCountableFail|`Fail(UncountableCountable)`
|`Unset`|Uncountable|VoidUncountableOverwrite|`Set_NewUncountable()`
|`Unset`|Uncountable|VoidUncountableKeep|`Noop()`
|`Unset`|Uncountable|VoidUncountableFail|`Fail(VoidUncountable)`
|Atom|Uncountable|AtomUncountableOverwrite|`Set_NewUncountable()`
|Atom|Uncountable|AtomUncountableKeep|`Noop()`
|Atom|Uncountable|AtomUncountableFail|`Fail(AtomUncountable)`
|Countable|Uncountable|CountableUncountableOverwrite|`Set_NewUncountable()`
|Countable|Uncountable|CountableUncountableKeep|`Noop()`
|Countable|Uncountable|CountableUncountableFail|`Fail(CountableUncountable)`
|Uncountable|Uncountable|UncountableUncountableOverwrite|`Set_NewUncountable()`
|Uncountable|Uncountable|UncountableUncountableKeep|`Noop()`
|Uncountable|Uncountable|UncountableUncountableFail|`Fail(UncountableUncountable)`

The _merging procedure_ for non-root _cursors_ would iterate through the rest of the _cursor_ elements and its _head_ until the _cursor_ is exhausted, a keep decision is made for a _target_ _arc_ that is incompatible with the rest of the _cursor_ or a fail decision is made. Transcribe Protocol v1.0 recognizes the following significant states during the execution of this _merging loop_:

1. LOOP_INPUIT - the initial state of the _merging loop_; in this state the _merging loop_ follows the _cursor_ throughout the _arcs_ of the _target_ graph without doing any changes (for ex. with `target = { a: { b: [5] } }, compactCursor = [6, "a", "b", 0]` the _merging loop_ will stay in LOOP_INPUIT state for iterations 0, 1, 2 - until the _cursor_ has been exhausted).

2. LOOP_EXTEND - while following the _cursor_ throughout the _arcs_ of the _target_ graph when the _merging loop_ has exhausted the _target_ _arcs_ but the _cursor_ has more elements, it enters the LOOP_EXTEND state  (for ex. with `target = { a: { b: 5 } }, compactCursor = [6, "a", "b", "c", 0]` the _merging loop_ will enter LOOP_EXTEND state at iteration 2). NOTE: The _target_ graph is considered exhausted also when the _merging loop_ has generated a _merge action_ that replaces a _target_ graph's _vertex_ with a new one, effectively ending the graph Traversal.

After the _merging loop_ ends, the _merging procedure_ might end up in one of the following two states:

3. FINAL_TRIM - this state indicates that the _cursor_ has been exhausted but the _target_ has been not; in this case the _merging procedure_ is set to replace the current _target_'s _arc_ _head_ with the _cursor_'s head or to execute a `Delete` _head_ instruction.

4. FINAL_HEAD - this state indicates that both the _cursor_ and the _target_ have been exhausted; in this case the _merging procedure_ is set to add the _cursor_'s _head_ to the _target_ as a new arc _arc_ added to the last know _target_ _arc_ or to execute a `Delete` _head_ instruction.

All four states cover different sets of possible combinations between _target_ and _cursor_ arcs. Next are listed the recommended rules for building a _merge plans_ for each state.

LOOP_INPUIT:

|Target vertex|Cursor vertex|Merge decision|Resulting merge action|State change
|--|--|--|--|--
|Atom|Countable|AtomCountableOverwrite|`Set_NewCountable(label)`|LOOP_EXTEND
|Atom|Countable|AtomCountableKeep|`Noop()`|FINAL_HEAD
|Atom|Countable|AtomCountableFail|`Fail(label, AtomCountable)`|-
|Countable|Countable|CountableCountableOverwrite|`Set_NewCountable(label)`|LOOP_EXTEND
|Countable|Countable|CountableCountableKeep|`Noop(label)`|-
|Countable|Countable|CountableCountableFail|`Fail(label, CountableCountable)`|-
|Uncountable|Countable|UncountableCountableOverwrite|`Set_NewCountable(label)`|LOOP_EXTEND
|Uncountable|Countable|UncountableCountableKeep|`Noop()`|FINAL_HEAD
|Uncountable|Countable|UncountableCountableFail|`Fail(label, CountableCountable)`|-
|Atom|Uncountable|AtomUncountableOverwrite|`Set_NewUncountable(label)`|LOOP_EXTEND
|Atom|Uncountable|AtomUncountableKeep|`Noop()`|FINAL_HEAD
|Atom|Uncountable|AtomUncountableFail|`Fail(label, AtomUncountable)`|-
|Countable|Uncountable|CountableUncountableOverwrite|`Set_NewUncountable(label)`|LOOP_EXTEND
|Countable|Uncountable|CountableUncountableKeep|`Noop()`|FINAL_HEAD
|Countable|Uncountable|CountableUncountableFail|`Fail(label, CountableUncountable)`|-
|Uncountable|Uncountable|UncountableUncountableOverwrite|`Set_NewUncountable(label)`|LOOP_EXTEND
|Uncountable|Uncountable|UncountableUncountableKeep|`Noop(label)`|-
|Uncountable|Uncountable|UncountableUncountableFail|`Fail(label, UncountableUncountable)`|-

LOOP_EXTEND:

|Target vertex|Cursor vertex|Merge decision|Resulting merge action|State change
|--|--|--|--|--
|Void|Countable|VoidCountableOverwrite|`Set_NewCountable(label)`|-
|Void|Countable|VoidCountableKeep|`Noop()`|FINAL_TRIM
|Void|Countable|VoidCountableFail|`Fail(label, VoidCountable)`|-
|Void|Uncountable|VoidUncountableOverwrite|`Set_NewCountable(label)`|-
|Void|Uncountable|VoidUncountableKeep|`Noop()`|FINAL_TRIM
|Void|Uncountable|VoidUncountableFail|`Fail(label, VoidUncountable)`|-

FINAL_TRIM:

|Target vertex|Cursor head|Merge decision|Resulting merge action
|--|--|--|--
|Atom|Delete|AtomVoidOverwrite|`Delete(label)`
|Atom|Delete|AtomVoidKeep|`Noop()`
|Atom|Delete|AtomVoidFail|`Fail(label, AtomVoid)`
|Countable|Delete|CountableVoidOverwrite|`Delete(label)`
|Countable|Delete|CountableVoidKeep|`Noop()`
|Countable|Delete|CountableVoidFail|`Fail(label, CountableVoid)`
|Uncountable|Delete|UncountableVoidOverwrite|`Delete(label)`
|Uncountable|Delete|UncountableVoidKeep|`Noop()`
|Uncountable|Delete|UncountableVoidFail|`Fail(label, UncountableVoid)`
|Atom|Atom `value`|AtomAtomOverwrite|`Set_Atom(label, value)`
|Atom|Atom `value`|AtomAtomKeep|`Noop()`
|Atom|Atom `value`|AtomAtomFail|`Fail(label, AtomAtom)`
|Countable|Atom `value`|CountableAtomOverwrite|`Set_Atom(label, value)`
|Countable|Atom `value`|CountableAtomKeep|`Noop()`
|Countable|Atom `value`|CountableAtomFail|`Fail(label, CountableAtom)`
|Uncountable|Atom `value`|UncountableAtomOverwrite|`Set_Atom(label, value)`
|Uncountable|Atom `value`|UncountableAtomKeep|`Noop()`
|Uncountable|Atom `value`|UncountableAtomFail|`Fail(label, UncountableAtom)`
|Atom|Countable|AtomCountableOverwrite|`Set_NewCountable(label)`
|Atom|Countable|AtomCountableKeep|`Noop()`
|Atom|Countable|AtomCountableFail|`Fail(label, AtomCountable)`
|Countable|Countable|CountableCountableOverwrite|`Set_NewCountable(label)`
|Countable|Countable|CountableCountableKeep|`Noop()`
|Countable|Countable|CountableCountableFail|`Fail(label, CountableCountable)`
|Uncountable|Countable|UncountableCountableOverwrite|`Set_NewCountable(label)`
|Uncountable|Countable|UncountableCountableKeep|`Noop()`
|Uncountable|Countable|UncountableCountableFail|`Fail(label, UncountableCountable)`
|Atom|Uncountable|AtomUncountableOverwrite|`Set_NewUncountable(label)`
|Atom|Uncountable|AtomUncountableKeep|`Noop()`
|Atom|Uncountable|AtomUncountableFail|`Fail(label, AtomUncountable)`
|Countable|Uncountable|CountableUncountableOverwrite|`Set_NewUncountable(label)`
|Countable|Uncountable|CountableUncountableKeep|`Noop()`
|Countable|Uncountable|CountableUncountableFail|`Fail(label, CountableUncountable)`
|Uncountable|Uncountable|UncountableUncountableOverwrite|`Set_NewUncountable(label)`
|Uncountable|Uncountable|UncountableUncountableKeep|`Noop()`
|Uncountable|Uncountable|UncountableUncountableFail|`Fail(label, UncountableUncountable)`

FINAL_HEAD:

|Target vertex|Cursor head|Merge decision|Resulting merge action
|--|--|--|--
|Void|Delete|VoidVoidOverwrite|`Noop()`
|Void|Delete|VoidVoidKeep|`Noop()`
|Void|Delete|VoidVoidFail|`Fail(label, VoidVoid)`
|Void|Atom|VoidAtomOverwrite|`Set_Atom(label, value)`
|Void|Atom|VoidAtomKeep|`Noop()`
|Void|Atom|VoidAtomFail|`Fail(label, VoidAtom)`
|Void|Countable|VoidCountableOverwrite|`Set_NewCountable(label)`
|Void|Countable|VoidCountableKeep|`Noop()`
|Void|Countable|VoidCountableFail|`Fail(label, VoidCountable)`
|Void|Uncountable|VoidUncountableOverwrite|`Set_NewUncountable(label)`
|Void|Uncountable|VoidUncountableKeep|`Noop()`
|Void|Uncountable|VoidUncountableFail|`Fail(label, VoidUncountable)`

### Simplified Graph Listing and Merge and DotSharp Implementation in Python

```python
class Sentinel:
    def __init__(self, name):
        self.name = name
    
    def __repr__(self):
        return self.name

# Sentinel values for vertex cardinalities
Cardinality_Zero = Sentinel("Cardinality_Zero")       # Atomic vertices
Cardinality_AlephNull = Sentinel("Cardinality_AlephNull")  # Countable composites (lists)
Cardinality_AlephOne = Sentinel("Cardinality_AlephOne")   # Uncountable composites (dicts)
Cardinality_Void = Sentinel("Cardinality_Void")       # Void (non-existent) vertices

# Merge policy sentinel values
Merge_Fail = Sentinel("Merge_Fail")
Merge_Keep = Sentinel("Merge_Keep")
Merge_Overwrite = Sentinel("Merge_Overwrite")

class JsonFabric:
    """
    Fabric implementation for JSON-like structures following TP v1.0 specifications.
    Recognizes dicts as uncountable composites, lists as countable composites, 
    and all other values as atomic vertices.
    """
    
    def get_vertex_cardinality(self, vertex):
        """
        Recognize vertex cardinality based on vertex type.
        Returns: Cardinality_Zero, Cardinality_AlephNull, or Cardinality_AlephOne
        """
        if isinstance(vertex, dict): return Cardinality_AlephOne   # Uncountable composite
        elif isinstance(vertex, list): return Cardinality_AlephNull  # Countable composite
        else: return Cardinality_Zero       # Atomic vertex
    
    def get_label_cardinality(self, label):
        """
        Recognize label cardinality based on label type.
        Returns: Cardinality_AlephNull for integers, Cardinality_AlephOne for strings
        """
        if isinstance(label, int): return Cardinality_AlephNull  # Countable label
        else: return Cardinality_AlephOne   # Uncountable label (string)
    
    def arc_exists(self, tail_vertex, label):
        """
        Check if an arc with the given label exists starting from tail_vertex.
        Returns: True if arc exists, False otherwise
        """
        if isinstance(tail_vertex, dict): return label in tail_vertex
        elif isinstance(tail_vertex, list): return isinstance(label, int) and 0 <= label < len(tail_vertex)
        else: return False  # Atomic vertices have no arcs
    
    def create_countable_composite(self, initial_size=None):
        """
        Create a new countable composite vertex (list).
        Args:
            initial_size: Optional initial size for the list
        Returns: New empty list or list with specified size
        """
        if initial_size is None: return []
        else: return [None] * initial_size
    
    def create_uncountable_composite(self):
        """
        Create a new uncountable composite vertex (dict).
        Returns: New empty dict
        """
        return {}
    
    def is_coherent(self, vertex_cardinality, label_cardinality):
        """
        Check tail-label coherence.
        Returns: True if vertex and label cardinalities are coherent
        """
        if vertex_cardinality == Cardinality_AlephNull: return label_cardinality == Cardinality_AlephNull
        elif vertex_cardinality == Cardinality_AlephOne: return label_cardinality == Cardinality_AlephOne
        else: return False  # Atomic vertices cannot have arcs


def query_merge_policy_use_mine(path, target_cardinality, source_cardinality):
    """Default merge policy: overwrite if atomic or cardinalities differ, otherwise keep"""
    if source_cardinality == Cardinality_Zero or target_cardinality != source_cardinality: return Merge_Overwrite
    else: return Merge_Keep

def apply_cursor(cursor, target_root, policy_fn, fabric):
    """Apply a single cursor to target_root, returning modified target_root"""
    path = cursor["path"]
    value = cursor["value"]
    current_path = []
    
    # ROOTED CURSOR CASE (path indicates an atomic cursor)
    if len(path) == 0:
        target_root_cardinality = fabric.get_vertex_cardinality(target_root)

        if value != Cardinality_AlephOne and value != Cardinality_AlephNull: source_cardinality = fabric.get_vertex_cardinality(value)
        else: source_cardinality = value

        decision = policy_fn(current_path, target_root_cardinality, source_cardinality)
        if decision == Merge_Fail: raise Exception("Merge failed at root")
        elif decision == Merge_Keep: return target_root
        elif decision == Merge_Overwrite:
            if source_cardinality == Cardinality_AlephOne: return fabric.create_uncountable_composite()
            elif source_cardinality == Cardinality_AlephNull: return fabric.create_countable_composite()
            else: return value
        else: raise NotImplementedError("Unknown merge decision")
    
    # PRELIMINARY STEP: Handle target_root merging

    target_arc_tail = None          # a virtual arc with the root vertex as a head has no tail (root has no container or label)
    target_arc_label = None         # a virtual arc with the root vertex as a head has no label (root has no container or label)
    target_arc_head = target_root
    target_arc_head_cardinality = fabric.get_vertex_cardinality(target_arc_head)

    #source_arc_tail = None          # a virtual arc with the root vertex as a head has no tail (root has no container or label)
    source_arc_label = None         # a virtual arc with the root vertex as a head has no label (root has no container or label)
    #source_arc_head = None          # a virtual arc with the root vertex as a head has source root head that is unknowable with compact graph paths
    source_arc_head_cardinality = fabric.get_label_cardinality(path[0])

    decision = policy_fn(current_path, target_arc_head_cardinality, source_arc_head_cardinality)
    if decision == Merge_Fail: raise Exception("Merge failed at root preparation")
    elif decision == Merge_Keep: pass
    elif decision == Merge_Overwrite:
        if source_arc_head_cardinality == Cardinality_AlephOne: target_arc_head = target_root = fabric.create_uncountable_composite()
        elif source_arc_head_cardinality == Cardinality_AlephNull: target_arc_head = target_root = fabric.create_countable_composite()
        else: raise Exception("Invalid operation in root preparation")
    else: raise NotImplementedError("Unknown merge decision")
    
    # MAIN LOOP
    for i in range(len(path)):

        target_arc_tail = target_arc_head
        target_arc_label = path[i]
        if fabric.arc_exists(target_arc_tail, target_arc_label):
            target_arc_head = target_arc_tail[target_arc_label]
            target_arc_head_cardinality = fabric.get_vertex_cardinality(target_arc_head)
        else:
            target_arc_head = None
            target_arc_head_cardinality = Cardinality_Void

        #source_arc_tail = None          # a virtual arc with the root vertex as a head has source tail that is unknowable with compact graph paths
        source_arc_label = path[i]
        #source_arc_head = None          # a virtual arc with the root vertex as a head has source head that is unknowable with compact graph paths
        if i < len(path) - 1: source_arc_head_cardinality = fabric.get_label_cardinality(path[i + 1])
        else:
            if value != Cardinality_AlephOne and value != Cardinality_AlephNull: source_arc_head_cardinality = Cardinality_Zero
            else: source_arc_head_cardinality = value

        current_path.append(source_arc_label)
        decision = policy_fn(current_path, target_arc_head_cardinality, source_arc_head_cardinality)
        if decision == Merge_Fail: raise Exception(f"Merge failed at path {current_path}")
        elif decision == Merge_Keep: continue
        elif decision == Merge_Overwrite:
            if source_arc_head_cardinality == Cardinality_AlephOne: target_arc_head = fabric.create_uncountable_composite()
            elif source_arc_head_cardinality == Cardinality_AlephNull: target_arc_head = fabric.create_countable_composite()
            elif source_arc_head_cardinality == Cardinality_Zero: target_arc_head = value
            else: raise NotImplementedError("Unknown source cardinality")
            target_arc_tail[target_arc_label] = target_arc_head
        else: raise NotImplementedError("Unknown merge decision")
    return target_root

def graph_merge(cursors, target_root=None, policy_fn=None, fabric=None):
    """
    Rebuild graph structure from cursor list
    Args:
        cursors: List of {"path": [...], "value": any} objects
        target_root: Initial target graph (None for empty)
        policy_fn: Callback to resolve path conflicts
        fabric: Fabric instance for vertex operations
    Returns:
        Reconstructed graph structure
    """
    if fabric is None: fabric = JsonFabric()
    if policy_fn is None: policy_fn = query_merge_policy_use_mine
    for cursor in cursors: target_root = apply_cursor(cursor, target_root, policy_fn, fabric)
    return target_root

def graph_list(data, fabric=None, _path=None):
    """
    Create a list of cursors representing all vertices in the graph.
    Args:
        data: Root vertex to traverse
        fabric: Fabric instance for vertex type recognition
        _path: Internal parameter for recursion
    Returns: List of {"path": [...], "value": vertex} cursors
    """
    if fabric is None: fabric = JsonFabric()
    if _path is None: _path = []
    result = []
    cardinality = fabric.get_vertex_cardinality(data)
    if cardinality == Cardinality_AlephOne:  # Uncountable composite - traverse dict
        if len(data) == 0: result.append({"path": _path, "value": Cardinality_AlephOne})
        else:
            for key, value in data.items():
                result.extend(graph_list(value, fabric, _path + [key]))
    elif cardinality == Cardinality_AlephNull:  # Countable composite - don't traverse
        if len(data) == 0: result.append({"path": _path, "value": Cardinality_AlephNull})
        else: result.append({"path": _path, "value": data})
    else: result.append({"path": _path, "value": data})   # Atomic vertex
    return result

def _encode_component(value):
    """
    Encode a path component into dot-sharp notation.
    
    Args:
        value: string or integer to encode
        
    Returns:
        Encoded component as string or integer
    """
    if isinstance(value, int):
        return value
    
    if len(value) == 0:
        return "\\0"
    
    # Escape dots, backslashes, and sharps
    return value.replace("\\", "\\\\").replace(".", "\\.").replace("#", "\\#")

def _append_component(path, encoded_component):
    """
    Append an encoded component to a dot-sharp path.
    
    Args:
        path: Current path as string, integer, or None
        encoded_component: Component to append as string or integer
        
    Returns:
        New path as string
    """
    if isinstance(encoded_component, int):
        if path is None:
            return f"#{encoded_component}"
        elif isinstance(path, int):
            return f"#{path}#{encoded_component}"
        elif len(path) == 0 or path == "\\0":
            return f"\\0#{encoded_component}"
        else:
            return f"{path}#{encoded_component}"
    else:  # encoded_component is string
        if path is None:
            if len(encoded_component) == 0 or encoded_component == "\\0":
                return "\\0"
            return encoded_component
        elif isinstance(path, int):
            if len(encoded_component) == 0 or encoded_component == "\\0":
                return f"#{path}."
            elif encoded_component.startswith("#"):
                return f"#{path}{encoded_component}"
            else:
                return f"#{path}.{encoded_component}"
        elif len(path) == 0 or path == "\\0":
            if len(encoded_component) == 0 or encoded_component == "\\0":
                return "."
            elif encoded_component.startswith("#"):
                return f"\\0{encoded_component}"
            else:
                return f".{encoded_component}"
        else:
            if len(encoded_component) == 0 or encoded_component == "\\0":
                return f"{path}."
            elif encoded_component.startswith("#"):
                return f"{path}{encoded_component}"
            else:
                return f"{path}.{encoded_component}"

def graph_path_to_dotsharp(path):
    """
    Convert a cursor path (list of strings/integers) to dot-sharp notation.
    
    Args:
        path: List of strings and integers representing a graph path
        
    Returns:
        Dot-sharp encoded path as string
    """
    if len(path) == 0:
        return "\\0"  # Empty path becomes \\0
    
    result = None
    for component in path:
        encoded = _encode_component(component)
        result = _append_component(result, encoded)
    
    return result

def _decode_component(value):
    """
    Decode a dot-sharp notation component.
    
    Args:
        value: string or integer to decode
        
    Returns:
        Decoded component as string or integer
    """
    if isinstance(value, int):
        return value
    
    if value == "\\" or value == "\\0" or value == "":
        return ""
    
    if '\\' not in value:
        return value
    
    # Decode escape sequences
    result = ""
    i = 0
    while i < len(value):
        if value[i] == '\\' and i + 1 < len(value):
            result += value[i + 1]  # Add the escaped character
            i += 2
        else:
            result += value[i]
            i += 1
    
    return result

def _split_by_delimiter(path, delimiter):
    """
    Split path by delimiter, respecting escape sequences.
    
    Args:
        path: String to split
        delimiter: Character to split on ('.' or '#')
        
    Returns:
        List of split components
    """
    if len(path) == 0:
        return [""]
    
    result = []
    current = ""
    i = 0
    
    while i < len(path):
        if path[i] == '\\' and i + 1 < len(path):
            # Escape sequence - add both characters to current
            current += path[i:i+2]
            i += 2
        elif path[i] == delimiter:
            # Found unescaped delimiter
            result.append(current)
            current = ""
            i += 1
        else:
            current += path[i]
            i += 1
    
    result.append(current)
    return result

def dotsharp_to_graph_path(dotsharp_path):
    """
    Parse a dot-sharp notation string into a list of path components.
    
    Args:
        dotsharp_path: Dot-sharp encoded path as string, integer, or None
        
    Returns:
        List of decoded path components (strings and integers)
    """
    if dotsharp_path is None:
        return []
    
    if isinstance(dotsharp_path, int):
        return [dotsharp_path]
    
    if len(dotsharp_path) == 0 or dotsharp_path == "\\0":
        return [""]
    
    if dotsharp_path == "\\":
        return ["\\"]
    
    result = []
    
    # Split by unescaped dots first
    dot_parts = _split_by_delimiter(dotsharp_path, '.')
    
    for i, part in enumerate(dot_parts):
        # Check if this part contains unescaped sharps
        has_unescaped_sharp = False
        j = 0
        while j < len(part):
            if part[j] == '#' and (j == 0 or part[j-1] != '\\'):
                has_unescaped_sharp = True
                break
            elif part[j] == '\\' and j + 1 < len(part):
                j += 2  # Skip escaped character
            else:
                j += 1
        
        if has_unescaped_sharp:
            # Split by unescaped sharps
            sharp_parts = _split_by_delimiter(part, '#')
            
            # First part (before any #) - add if not empty or if this is not first dot part
            if sharp_parts[0] != "" or i != 0:
                result.append(_decode_component(sharp_parts[0]))
            
            # Remaining parts should be integers
            for k in range(1, len(sharp_parts)):
                try:
                    result.append(int(sharp_parts[k]))
                except ValueError:
                    # If not a valid integer, treat as escaped string
                    result.append(_decode_component(sharp_parts[k]))
        else:
            # No unescaped sharps, treat as regular string component
            result.append(_decode_component(part))
    
    return result

# Test the fabric and function
def _run_tests():
    """Run tests to verify graph_list and graph_merge work correctly"""
    fabric = JsonFabric()
    
    # Test round-trip: list -> merge
    data = {"name": "test", "value": 42}
    cursors = graph_list(data, fabric)
    merged = graph_merge(cursors, None, None, fabric)
    assert data == merged, f"Round trip failed: {data} != {merged}"
    
    # Test atomic root
    atomic_cursors = [{"path": [], "value": 100}]
    merged_atomic = graph_merge(atomic_cursors, None, None, fabric)
    assert merged_atomic == 100, f"Atomic root failed: {merged_atomic}"
    
    # Test empty structures
    empty_cursors = [
        {"path": ["empty_dict"], "value": Cardinality_AlephOne},
        {"path": ["empty_list"], "value": Cardinality_AlephNull}
    ]
    merged_empty = graph_merge(empty_cursors, None, None, fabric)
    expected_empty = {"empty_dict": {}, "empty_list": []}
    assert merged_empty == expected_empty, f"Empty structures failed: {merged_empty}"
    
    # Test conflict resolution
    conflict_cursors = [
        {"path": ["config"], "value": 100},
        {"path": ["config"], "value": 200}
    ]
    merged_conflict = graph_merge(conflict_cursors, None, None, fabric)
    assert merged_conflict == {"config": 200}, f"Conflict resolution failed: {merged_conflict}"
    
    # Test with existing target
    existing = {"existing": "data"}
    new_cursors = [{"path": ["new"], "value": "added"}]
    merged_existing = graph_merge(new_cursors, existing, None, fabric)
    expected_existing = {"existing": "data", "new": "added"}
    assert merged_existing == expected_existing, f"Merge into existing failed: {merged_existing}"
    
    # Test nested structures
    data_nested = {
        "name": "test",
        "config": {
            "width": 100,
            "nested": {"deep": "value"}
        },
        "items": [1, 2, 3]
    }
    cursors_nested = graph_list(data_nested, fabric)
    merged_nested = graph_merge(cursors_nested, None, None, fabric)
    assert data_nested == merged_nested, f"Nested round trip failed: {data_nested} != {merged_nested}"

    # Test dot-sharp notation
    test_paths = [
        ([], "\\0"),
        (["a"], "a"),
        ([0], "#0"),
        (["a", "b"], "a.b"),
        ([0, 1], "#0#1"),
        (["a", 0], "a#0"),
        ([0, "b"], "#0.b"),
        ([""], "\\0"),
        (["", ""], "."),
        (["a.b#c\\d"], "a\\.b\\#c\\\\d"),
        (["a", "", "b"], "a..b"),
    ]
    
    for path, expected in test_paths:
        result = graph_path_to_dotsharp(path)
        assert result == expected, f"Dot-sharp encode test failed: {path} -> expected '{expected}', got '{result}'"
    
    # Test dot-sharp parsing (round-trip)
    test_dotsharp_strings = [
        "\\0",
        "a", 
        "#0",
        "a.b",
        "#0#1", 
        "a#0",
        "#0.b",
        ".",
        "a\\.b\\#c\\\\d",
        "a..b"
    ]
    
    for dotsharp_str in test_dotsharp_strings:
        parsed = dotsharp_to_graph_path(dotsharp_str)
        encoded = graph_path_to_dotsharp(parsed)
        assert encoded == dotsharp_str, f"Dot-sharp round-trip failed: '{dotsharp_str}' -> {parsed} -> '{encoded}'"

# Run tests on module load - silent unless they fail
try:
    _run_tests()
except Exception as e:
    print(f"❌ TEST FAILED: {e}")
    raise
```

Graph Translation
-------------------

_TODO: consider using merge actions outside the context of cursor merging and for all for graph translation_
_TODO: awaiting first conceptual implementation_

Common Operations on Graphs, Graph Paths/Cursors and Graph Cursor Lists
-------------------

### Listing and Merging

_TODO: text_

### Fusing and Spreading

_TODO: text_

### Rotation

- _Graph path/cursor_ _rotation_ works the same way the binary rotation works on numbers.
- _Graph_ _rotation_ designates a graph transcription process consisting of the following steps: representing the _graph_ as a list of _cursors_, applying the same _rotation_ on every _cursor_, _inflating_ all _cursors_ into a _target graph_.

### Condensing and Exhausting

_TODO: text_

### Filtration

_TODO: text_

### Cloning

_TODO: text_

### Serialization/Deserialization

_TODO: text_

Performance and Immutability
===========================

In the scope of graph transcription, performance and immutability are mutually excluding concepts. A functional approach towards operations on graphs grants immutability but would require copies of graphs or parts of graphs to be created and returned by every single operation adding memory management cost. On the other hand, instance mutations of existing graphs, which tend to provide much better performance opportunities, violate immutability.

Transcribe Protocol v1.0 does not presume any of the above approaches to be better than the other and therefore postulates that the decision on the concrete approach shall be outsourced to the programmer who's using the graph-transcribtion implementation, and this shall be done on a most granular level possible. For achieving this, the following measures are recommended:

- All operations on _graph paths_, _graph cursors_ and lists of _graph paths/cursors_ must accept an optional `target` parameter; if `target` is provided, the operation must write its result to `target`, this way outsourcing memory management to the operation user; otherwise the operation must mutate the source _graph paths_, _graph cursors_ or lists of _graph paths/cursors_; every function implementing an operation must return a reference to the final result, be it the source or the target instance. Operations on graphs, on the other side, are not recommended to follow the above pattern, because it would involve graph cloning as part of the process, which is considered a non-trivial operation by Transcribe Protocol v1.0.

_TODO: more_

Further Considerations
===========================

Transcribe Protocol v2.0 roadmap might include:

- Standartization of multi-_source_ transcription.
- Handling of hybrid _vertices_ (_vertices_ capable of starting arcs with both _countable_ and _uncountable_ labels). Accepting the existence of arcs with identical _labels_ starting from the same _vertex_, and treating hybrid _vertices_ as a pair of one _countable_ and one _uncountable_ _vertex_ could potentially offer a usable theoretical model capable of representing hybrid real-world situations.
- Full recommendations on the _Transaction strategy_ and _mutant strategy_ for _merging procedures_.