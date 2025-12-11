html
===================
- html block (with all innerHTML)

	```
	<style>
	  [data-xd] {display: none;}
	</style>
	
	```

	- insert
	```
	<x-mods><x-mod j="0x456DEF+">TEXTN<div id="content" class="high-contrast" data-custom="something">
		<p class="para">edrfgrewg</p>
	</div>TEXOUT</x-mod></x-mods>
	
	```
	- remove
	```
	<x-mods><x-mod j="0xDEF456-" data-xd>TEXIN<xd-div data-xd-id="content" data-xd-class="high-contrast" data-xd-data-custom="something">
		<p data-xd-class="pararm">g245gtwrgwrtghg3425</p>
	</div>TEXOUT</x-mod></x-mods>
			
	```
	
	- replace
	```
	<x-mods><x-mod j="0x456DEF*" data-xd>TEXTN<xd-div data-xd-id="content" data-xd-class="high-contrast" data-xd-data-custom="something">
		<xd-p data-xd-class="pararm">g245gtwrgwrtghg3425</xd-p>
	</xd-div>TEXOUT</x-mod>
	<x-mod j="0x456DEF*">TEXTN2<div id="content" class="high-contrast" data-custom="something">
		<p class="para">edrfgrewg</p>
	</div>TEXOUT2</x-mod></x-mods>
	
	```

	- stacking
	```
	<x-mods><x-mod j="0x456DEF+0x123ABC*" data-xd>TEXTN<xd-div data-xd-id="content" data-xd-class="high-contrast" data-xd-data-custom="something">
		<xd-p data-xd-class="parainsrm">ejhbfrgvoergvb</xd-p>
	</xd-div>TEXOUT</x-mod>
	<x-mod j="0x123ABC*">TEXTN2<div id="content" class="high-contrast" data-custom="something">
		<p class="para">edrfgrewg</p>
	</div>TEXOUT2</x-mod></x-mods>
	
	```


- html tag

	- insert
	```
	<div class="cls1 cls2" data-xd-j="0x123ABC+class">
	
	```
	- remove
	```
	<div data-xda1-class="cls1 cls2" data-xaj="0x123ABC-class">
			
	```
	
	- replace
	```
	<div class="cls1 cls2" data-xda0-class="cls9 cls8" data-xaj="0x123ABC-class&0x123ABC+class">
	
	```

	- stacking
	```
	<div class="cls9 cls8" data-xad0-class="cls1 cls2" data-xaj="0x456DEF+class&0x123ABC-class&0x123ABC+class">

	<div class="cls9 cls8" class="cls7 cls6" data-xad0-class="cls1 cls2" data-xaj="0x456DEF+class&0x123ABC-class&0x123ABC+class&0x456DEF+class">
	
	<div class="cls7 cls6" data-xad0-class="cls1 cls2" data-xad1-class="cls9 cls8" data-xaj="0x456DEF+class&0x123ABC-class&0x123ABC+class&0x456DEF+class&0x111111-class">

	```

- mixed

	- replace
	```
	<x-mods><x-mod j="0x456DEF-" data-xd>TEXTN<xd-div data-xd-id="content" data-xd-class="high-contrast" data-xd-data-custom="something" data-xd-data-xaj="0x123ABC+class">
		<p data-xd-class="pararm">g245gtwrgwrtghg3425</p>
	</div>TEXOUT</x-mod>
	<x-mod j="0x456DEF+">TEXTN2<div id="content" class="high-contrast" data-custom="something" data-xaj="0x123ABC+class">
		<p class="para">edrfgrewg</p>
	</div>TEXOUT2</x-mod></x-mods>
	
	```

php
===================

	- insert
	```
	if (true) { 'x-mods';
		if (true) { 'x-mod 0x456DEF+';
			$somevar = 1;
		'/x-mod'; }
	'/x-mods'; }
	
	```

	- remove
	```
	if (true) { 'x-mods';
		if (false) { 'x-mod 0xDEF456-';
			$somevar = 1;
		'/x-mod'; }
	'/x-mods'; }
	
	```
	
	- replace
	```
	if (true) { 'x-mods';
		if (false) { 'x-mod 0xDEF456*';
			$somevar1 = 2;
		'/x-mod'; }
		if (true) { 'x-mod 0x456DEF*';
			$somevar2 = 1;
		'/x-mod'; }
	'/x-mods'; }
	
	```

	- stacking
	```
	if (true) { 'x-mods';
		if (false) { 'x-mod 0x456DEF+0x123ABC*';
			$somevar = 1;
		'/x-mod'; }
		if (true) { 'x-mod 0x123ABC*';
			$somevar2 = 1;
		'/x-mod'; }
	'/x-mods'; }
	
	```

js
===================

	- insert
	```
	if (true) { void 'x-mods';
		if (true) { void 'x-mod 0x456DEF+';
			var somevar = 1;
		void '/x-mod'; }
	void '/x-mods'; }
	
	```
	- remove
	```
	if (true) { void 'x-mods';
		if (false) { void 'x-mod 0xDEF456-';
			var somevar = 1;
		void '/x-mod'; }
	void '/x-mods'; }
	```
	
	- replace
	```
	if (true) { void 'x-mods';
		if (false) { void 'x-mod 0xDEF456*';
			var somevar1 = 2;
		void '/x-mod'; }
		if (true) { void 'x-mod 0x456DEF*';
			var somevar2 = 1;
		void '/x-mod'; }
	void '/x-mods'; }
	
	```
	
	- stacking
	```
	if (true) { void 'x-mods';
		if (false) { void 'x-mod 0x456DEF+0x123ABC*';
			var somevar = 1;
		void '/x-mod'; }
		if (true) { void 'x-mod 0x123ABC*';
			var somevar2 = 1;
		void '/x-mod'; }
	void '/x-mods'; }
	
	```

css
===================
if such need arises, prefixing class names, property names and using --custom-props will do



locator query
===================
```
// Core types
public class Location 
{
   public int Value { get; }
   public string Name { get; set; } // Auto-generated or manual
}

public class Range
{
   public Location Start { get; }
   public Location End { get; }
   public string Name { get; set; } // Auto-generated or manual
}

public class ResultSet
{
   public List<Location> Locations { get; }
   public List<Range> Ranges { get; }
   
   public ResultSet Add(Location location);
   public ResultSet Add(Range range);
}

// Simple wrapper for naming regex matches
public class NamedMatch
{
   public Match Match { get; } // System.Text.RegularExpressions.Match
   public string Name { get; }
   public Dictionary<string, string> CapturedGroups { get; } // For regex group captures
}

// Query builder and executor
public class LocatorQuery
{
   public string FullText { get; } // Set in constructor
   
   public LocatorQuery(string fullText); // Constructor
   
   // Finding
   public LocatorQuery Find(string pattern);
   public LocatorQuery FindAfter(string pattern, Match match);
   public LocatorQuery FindAfter(string pattern, Location location);
   public LocatorQuery FindBefore(string pattern, Match match);
   public LocatorQuery FindBefore(string pattern, Location location);
   public LocatorQuery FindBetween(string pattern, Location start, Location end);
   
   // Chaining
   public LocatorQuery Then();
   public LocatorQuery ThenWithin(Func<LocatorQuery, LocatorQuery> searchFunc);
   
   // Metadata
   public LocatorQuery Name(string name); // Names the current step
   public LocatorQuery Capture(string name, int groupIndex); // Store regex groups
   public LocatorQuery Assert(Func<List<NamedMatch>, bool> condition, string message);
   
   // Selection - terminal operations that execute and return results
   public T Select<T>(Func<List<NamedMatch>, T> selector);
   public IEnumerable<T> SelectMany<T>(Func<List<NamedMatch>, IEnumerable<T>> selector);
}

```

examples
------------------
```
var result = new LocatorQuery(sourceCode)
    .Find(@"class\s+MyClass")
    .Name("class declaration")
    .Then()
    .Find(@"\{")
    .Name("opening brace")
    .Select(matches => new Location { 
        Value = matches.Last().Match.Index + matches.Last().Match.Length,
        Name = "after opening brace"
    });


// EXAMPLE 1: Simple insertion point
var locator = new LocatorQuery(sourceCode)
   .Find(@"public\s+void\s+Initialize")
   .Name("Initialize method signature")
   .Then()
   .Find(@"\{")
   .Name("opening brace")
   .Select(matches => {
       var braceMatch = matches.Last(m => m.Name == "opening brace");
       return new Location { 
           Value = braceMatch.Match.Index + braceMatch.Match.Length,
           Name = "after opening brace"
       };
   });

// EXAMPLE 2: Range replacement
var locator = new LocatorQuery(sourceCode)
   .Find(@"//\s*BEGIN_GENERATED")
   .Name("generation marker start")
   .Then()
   .Find(@"//\s*END_GENERATED")
   .Name("generation marker end")
   .Select(matches => {
       var begin = matches.First(m => m.Name == "generation marker start");
       var end = matches.First(m => m.Name == "generation marker end");
       
       // Find newline after begin marker
       var startPos = begin.Match.Index + begin.Match.Length;
       var newlineAfterBegin = sourceCode.IndexOf('\n', startPos);
       
       // Find newline before end marker  
       var endPos = end.Match.Index;
       var newlineBeforeEnd = sourceCode.LastIndexOf('\n', endPos);
       
       return new Range {
           Start = new Location { Value = newlineAfterBegin + 1 },
           End = new Location { Value = newlineBeforeEnd },
           Name = "generated code block"
       };
   });

// EXAMPLE 3: Multiple insertion points
var locator = new LocatorQuery(sourceCode)
   .Find(@"using\s+System;")
   .Name("System using statement")
   .SelectMany(matches => {
       var results = new List<Location>();
       foreach (var m in matches.Where(m => m.Name == "System using statement"))
       {
           results.Add(new Location { 
               Value = m.Match.Index,
               Name = $"before using at {m.Match.Index}"
           });
           results.Add(new Location {
               Value = m.Match.Index + m.Match.Length,
               Name = $"after using at {m.Match.Index}"
           });
       }
       return results;
   });

// EXAMPLE 4: Contextual validation
var locator = new LocatorQuery(htmlContent)
   .Find(@"<div[^>]*id=""content""[^>]*>")
   .Name("content div")
   .Assert(matches => matches.Count(m => m.Name == "content div") == 1, 
           "Expected single content div")
   .Then()
   .Find(@"</div>")  
   .Name("closing div")
   .Select(matches => {
       var open = matches.First(m => m.Name == "content div");
       var close = matches.Last(m => m.Name == "closing div");
       
       return new Range {
           Start = new Location { Value = open.Match.Index + open.Match.Length },
           End = new Location { Value = close.Match.Index },
           Name = "content div innerHTML"
       };
   });

// EXAMPLE 5: Complex Multi-Step
var locator = new LocatorQuery(sourceCode)
   .Find(@"namespace\s+MyApp")
   .Name("namespace declaration")
   .Assert(matches => matches.Any(), "Namespace not found")
   
   .ThenWithin(search => search
       .Find(@"class\s+(\w+)Controller")
       .Name("controller class")
       .Capture("className", 1))
   
   .ThenWithin(search => search
       .Find(@"public\s+ActionResult\s+Index")
       .Name("Index action"))
   
   .Then()
   .Find(@"\{")
   .Name("method opening brace")
   
   .Select(matches => {
       var methodStart = matches.First(m => m.Name == "method opening brace");
       var controllerMatch = matches.First(m => m.Name == "controller class");
       var className = controllerMatch.CapturedGroups["className"];
       
       var resultSet = new ResultSet();
       resultSet.Add(new Location {
           Value = methodStart.Match.Index + methodStart.Match.Length,
           Name = $"method body start in {className}"
       });
       
       return resultSet;
   });

// EXAMPLE 6: Optional patterns with manual flow control
var locator = new LocatorQuery(sourceCode)
   .Find(@"#region\s+Critical")
   .Name("critical section marker")
   .Then()
   .Find(@"#endregion")
   .Name("end marker")
   .Select(matches => {
       // Manual assertion for required match
       if (!matches.Any(m => m.Name == "critical section marker"))
           throw new Exception("Cannot proceed without finding critical section");
       
       // Optional pattern - check if exists
       if (matches.Any(m => m.Name == "end marker")) {
           var start = matches.First(m => m.Name == "critical section marker");
           var end = matches.First(m => m.Name == "end marker");
           return new Range {
               Start = new Location { Value = start.Match.Index },
               End = new Location { Value = end.Match.Index + end.Match.Length },
               Name = "critical region"
           };
       }
       else {
           // Fallback if optional pattern not found
           var start = matches.First(m => m.Name == "critical section marker");
           return new Range {
               Start = new Location { Value = start.Match.Index },
               End = new Location { Value = sourceCode.Length },
               Name = "critical region to EOF"
           };
       }
   });

// EXAMPLE 7: Using FindAfter for sequential patterns
var locator = new LocatorQuery(sourceCode)
   .Find(@"class\s+MyClass")
   .Name("class declaration")
   .Select(matches => {
       var classMatch = matches.First();
       
       // Find method after class declaration
       var methodQuery = new LocatorQuery(sourceCode)
           .FindAfter(@"void\s+Process", classMatch.Match)
           .Name("process method")
           .Select(m => m.First());
           
       return new Location {
           Value = methodQuery.Match.Index,
           Name = "Process method location"
       };
   });

// EXAMPLE 8: Working with captured groups
var locator = new LocatorQuery(sourceCode)
   .Find(@"public\s+(\w+)\s+(\w+)\s*\(")
   .Name("method signature")
   .Capture("returnType", 1)
   .Capture("methodName", 2)
   .SelectMany(matches => {
       var results = new List<Location>();
       foreach (var m in matches.Where(m => m.Name == "method signature"))
       {
           var returnType = m.CapturedGroups["returnType"];
           var methodName = m.CapturedGroups["methodName"];
           
           results.Add(new Location {
               Value = m.Match.Index,
               Name = $"{returnType} {methodName} method"
           });
       }
       return results;
   });
   
```
