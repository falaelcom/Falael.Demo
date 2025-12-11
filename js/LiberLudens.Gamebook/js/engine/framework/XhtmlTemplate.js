"use strict";

include("StdAfx.js");

////////////////////////////////////////////
//	XhtmlTemplate
if (!("XhtmlTemplate" in window)) window.XhtmlTemplate = {};

function TemplateEngine()
{
	this.templates = {};
}

//	ASYNC: the order of loading of template files is not guarantied
TemplateEngine.prototype.loadAllDocumentTemplateLinks = function (callback)
{
    var fileList = [];
    document.querySelectorAll('head link[rel=template]').forEach(function(node)
    {
        fileList.push(
        {
            id: node.getAttribute("id"),
            file: node.getAttribute("href"),
        });
    });
    return async.each(fileList, function(item, each_next)
    {
        return this.loadFromFile(item.id, item.file, each_next);
    }.bind(this),
    function done(err, result)
    {
        if (err)
        {
            console.error(2001001, err);
        }

        return callback(err)
    });
}

TemplateEngine.prototype.loadFromFile = function(templateId, file, callback)
{
    if (this.templates[templateId])
    {
        return callback("Template with id \"" + templateId + "\" already exists (1).");
    }

    return async.waterfall(
	[
		function(next)
		{
		    return Utility.IO.readFile(file, next);
		},
		function(xhtml, next)
		{
		    this.templates[templateId] = TemplateEngine.parseXhtml(xhtml);
		    return next();
		}.bind(this),
	], function done(err, result)
	{
	    if (err)
	    {
	    		console.error(2001002, err);
	    }

	    return callback(err);
	});
}

TemplateEngine.prototype.loadFromElement = function(templateId)
{
	var element = document.getElementById(templateId);
	if (!element)
	{
	    throw "Element with id \"" + templateId + "\" not found (2).";
	}
	if (this.templates[templateId])
	{
	    throw "Template with id \"" + templateId + "\" already exists (2).";
	}
	this.templates[templateId] = TemplateEngine.parseXhtml(element.innerHTML);
}

TemplateEngine.prototype.loadFromXhtml = function(templateId, xhtml)
{
    if (this.templates[templateId])
    {
        throw "Template with id \"" + templateId + "\" already exists (3).";
    }
    this.templates[templateId] = TemplateEngine.parseXhtml(xhtml);
}


TemplateEngine.prototype.has = function (templateId)
{
	return !!this.templates[templateId];
}

TemplateEngine.prototype.fill = function (templateId, fields)
{
    var template = this.templates[templateId];
    if (!template)
    {
        throw "Template id \"" + templateId + "\" not found.";
    }
    var sb = [];
    var ids = {};
    TemplateEngine.fill_processNode(sb, template.doc.firstChild, template.paths, [0], fields || {}, ids);
    return {
        xhtml: sb.join(""),
        ids: ids,
    };
}

TemplateEngine.prototype.apply = function(templateId, container, fields, append)
{
	append = append || false;

	var fill = this.fill(templateId, fields);

	if (append)
	{
		container.innerHTML += fill.xhtml;
	}
	else
	{
		container.innerHTML = fill.xhtml;
	}

	var result = {};
    for (var key in fill.ids)
    {
        var elementId = fill.ids[key];
        result[key] = document.getElementById(elementId);
    }
    return result;
}


TemplateEngine.fill_processNode = function(sb, node, paths, currentPath, fields, ids)
{
    function processText(sb, text, currentPathText, paths, fields, ids)
    {
        var fieldrefs = paths[currentPathText];
        if (fieldrefs)
        {
            var startIndex = 0;
            for (var length = fieldrefs.offsets.length, i = 0; i < length; ++i)
            {
                var item = fieldrefs.offsets[i];
                var fieldValue = fields[item.fieldName];
                var offset = item.offset;
                if (offset != startIndex)
                {
                    sb.push(text.substring(startIndex, offset));
                }
                switch (item.instruction)
                {
                    case "html":
                        sb.push(fieldValue);
                        break;
                    case "id":
                        ++TemplateEngine.idCounter;
                        sb.push(TemplateEngine.idCounter);
                        if (item.fieldName)
                        {
						 	ids[item.fieldName] = TemplateEngine.idCounter;
                        }
                        break;
                    case null:
               			sb.push(TemplateEngine.htmlEncode(fieldValue));
                        break;
                    default:
                        throw "Unrecognized instruction.";
                }
                startIndex = offset;
            }
            if (startIndex < text.length)
            {
                sb.push(text.substring(startIndex));
            }
            return;
        }
        sb.push(text);
    }

    var currentPathText = currentPath.join(",");

    if (node.nodeType == 3)
    {
        processText(sb, node.nodeValue, currentPathText, paths, fields, ids);
        return;
    }

    if (XhtmlTemplate.has(node.nodeName))
    {
    	var fields = {};
    	for (var length = node.attributes.length, i = 0; i < length; ++i)
    	{
    		var item = node.attributes[i];
    		fields[item.nodeName] = item.nodeValue;
    	}
    	sb.push(XhtmlTemplate.fill(node.nodeName, fields).xhtml);
    }
    else
    {
    	sb.push("<" + node.nodeName);

    	if (node.attributes)
    	{
    		for (var length = node.attributes.length, i = 0; i < length; ++i)
    		{
    			var item = node.attributes[i];
    			sb.push(" " + item.nodeName + "=\"")
    			processText(sb, item.nodeValue, currentPathText + "," + item.nodeName, paths, fields, ids);
    			sb.push("\"");
    		}
    	}

    	if (node.childNodes.length)
    	{
    		sb.push(">");
    		for (var length = node.childNodes.length, i = 0; i < length; ++i)
    		{
    			var childNode = node.childNodes[i];
    			currentPath.push(i);
    			TemplateEngine.fill_processNode(sb, childNode, paths, currentPath, fields, ids);
    			currentPath.pop();
    		}
    		sb.push("</" + node.nodeName + ">");
    		return;
    	}

    	sb.push(">");
    	sb.push("</" + node.nodeName + ">");
    }
}

TemplateEngine.parseXhtml = function(xhtml)
{
    var result =
    {
        doc: null,
        fields: {}, //  "fieldName": [ {path: nodeIndexPath[], instruction: instruction}, {path: nodeIndexPath[], instruction: instruction}, ... ], the last value in nodeIndexPath is the field ref index within the text done (aaa{fieldname}aaa) will yeld 2 as the last value
        paths: {},  //  reversed version of fields, "0,0,1": {offsets: [{fieldName: "fieldName", offset: 3, instruction: instruction}]}, "0,0,1" is a serialized version of a nodeIndexPath[] without the last index
    };
    result.doc = new DOMParser().parseFromString(xhtml, "application/xhtml+xml");

    TemplateEngine.parse_processNode(result.doc, result.fields, []);

    for (var fieldName in result.fields)
    {
        var fieldrefarr = result.fields[fieldName];
        for(var length = fieldrefarr.length, i = 0; i < length; ++i)
        {
            var item = fieldrefarr[i];
            var offset = item.path.pop();   //  remove the last index, which is offset in text
            var fieldlocationText = item.path.join(",");
            var fieldrefs = result.paths[fieldlocationText];
            if (!fieldrefs)
            {
                fieldrefs =
                {
                    offsets: [],
                };
                result.paths[fieldlocationText] = fieldrefs;
            }
            fieldrefs.offsets.push(
            {
            		fieldName: fieldName,
            		offset: offset,
                instruction : item.instruction,
            });
            item.path.push(offset);         //  add the last index back
        }
    }

    return result;
}

TemplateEngine.parse_processNode = function(node, fields, path)
{
    if (node.nodeValue)
    {
        node.nodeValue = TemplateEngine.parse_processNodeText(node.nodeValue, fields, path);
    }

    if (node.attributes)
    {
        for (var length = node.attributes.length, i = 0; i < length; ++i)
        {
            var item = node.attributes[i];
            path.push(item.nodeName);
            node.setAttribute(item.nodeName, TemplateEngine.parse_processNodeText(item.nodeValue, fields, path));
            path.pop();
        }
    }
    
    for (var length = node.childNodes.length, i = 0; i < length; ++i)
    {
        var childNode = node.childNodes[i];
        path.push(i);
        TemplateEngine.parse_processNode(childNode, fields, path);
        path.pop();
    }
}

TemplateEngine.parse_processNodeText = function(text, fields, path)
{
    var STATE_TEXT = 0;
    var STATE_FIELDREF_CANDIDATE = 1;
    var STATE_FIELDREF = 2;
    var STATE_FIELDREF_INSTRUCTION = 3;
    var STATE_RCURLYESCAPE_CANDIDATE = 4;
    var state = STATE_TEXT;
    var sb = [];
    var fieldref = [];
    var fieldinstruction = [];
    for (var length = text.length, i = 0; i < length; ++i)
    {
        var c = text[i];
        switch(state)
        {
            case STATE_TEXT:
                if (c == '{')
                {
                    state = STATE_FIELDREF_CANDIDATE;
                    break;
                }
                if (c == '}')
                {
                    state = STATE_RCURLYESCAPE_CANDIDATE;
                    break;
                }
                sb.push(c);
                break;
            case STATE_RCURLYESCAPE_CANDIDATE:
                if (c == '}')
                {
                    sb.push('}');
                    state = STATE_TEXT;
                    break;
                }
                throw "Invalid character '}'.";
            case STATE_FIELDREF_CANDIDATE:
                if (c == '{')
                {
                    sb.push('{');
                    state = STATE_TEXT;
                    break;
                }
                if (c == '}')
                {
                    throw "Invalid character '}'.";
                }
                if (c == ':')
                {
                    fieldref = [];
                    fieldinstruction = [];
                    state = STATE_FIELDREF_INSTRUCTION;
                    break;
                }
                fieldref = [c];
                fieldinstruction = [];
                state = STATE_FIELDREF;
                break;
            case STATE_FIELDREF:
            case STATE_FIELDREF_INSTRUCTION:
                if (c == '{')
                {
                    throw "Invalid character '{'.";
                }
                if (c == '}')
                {
                    var fieldname = fieldref.join("");
                    var fieldlocation = TemplateEngine.copyArray(path);
                    fieldlocation.push(sb.length);
                    var fieldrefarr = fields[fieldname];
                    if (!fieldrefarr)
                    {
                        fieldrefarr = [];
                        fields[fieldname] = fieldrefarr;
                    }
                    fieldrefarr.push(
                    {
                        path: fieldlocation,
                        instruction: fieldinstruction.length ? fieldinstruction.join("") : null,
                    });
                    state = STATE_TEXT;
                    break;
                }
                switch (state)
                {
                    case STATE_FIELDREF:
                        if (c == ':')
                        {
                            state = STATE_FIELDREF_INSTRUCTION;
                            break;
                        }
                        fieldref.push(c);
                        break;
                    case STATE_FIELDREF_INSTRUCTION:
                        fieldinstruction.push(c);
                        break;
                }
                break;
        }
    }
    return sb.join("");
}

TemplateEngine.idCounter = 0;


TemplateEngine.copyArray = function(array)
{
    var result = [];
    for (var length = array.length, i = 0; i < length; ++i)
    {
        result.push(array[i]);
    }
    return result;
}

TemplateEngine.htmlEncode = function(value)
{
	if (value === 0)
	{
		return String(0);
	}
	if (value === false)
	{
		return String(false);
	}
	if (!value)
	{
		return "";
	}
	return value.toString().replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};


TemplateEngine.fillInString = function (text, fields)
{
	var resultSb = [];

	var STATE_INPUT = 1;
	var STATE_ESCAPE_SEQUENCE = 2;
	var STATE_TAG = 3;

	var state = STATE_INPUT;
	var tagParts = [];
	var tagPartSb = [];

	for (var length = text.length, i = 0; i < length; ++i)
	{
		var c = text[i];

		switch(state)
		{
			case STATE_INPUT:
				switch(c)
				{
					case '\\':
						state = STATE_ESCAPE_SEQUENCE;
						break;
					case '{':
						state = STATE_TAG;
						break;
					default:
						resultSb.push(c);
						break;
				}
				break;
			case STATE_ESCAPE_SEQUENCE:
				switch(c)
				{
					case '{':
						resultSb.push(c);
						state = STATE_INPUT;
						break;
					default:
						resultSb.push('\\');
						resultSb.push(c);
						state = STATE_INPUT;
						break;
				}
				break;
			case STATE_TAG:
				switch(c)
				{
					case ':':
						tagParts.push(tagPartSb.join(""));
						tagPartSb = [];
						break;
					case '}':
						tagParts.push(tagPartSb.join(""));
						tagPartSb = [];

						var fieldsObj = fields;
						var value = "";
						for (var length2 = tagParts.length, i2 = 0; i2 < length2; ++i2) 
						{
							var item2 = tagParts[i2];
							value = fieldsObj[item2];
							if(typeof(value) == "undefined")
							{
								value = "";
								break;
							}
							fieldsObj = value;
						}
						resultSb.push(value);
						
						tagParts = [];
						state = STATE_INPUT;
						break;
					default:
						tagPartSb.push(c);
						break;
				}
				break;
			default:
				throw "Not implemented";
		}
	}

	return resultSb.join("");
}

TemplateEngine.fillIn = function (obj, fields)
{
	if (Object.isString(obj))
	{
		return TemplateEngine.fillInString(obj, fields);
	}

	if (Object.isArray(obj))
	{
		var result = [];
		for (var length = obj.length, i = 0; i < length; ++i)
		{
			result.push(TemplateEngine.fillIn(obj[i], fields));
		}
		return result;
	}

	if (Object.isObject(obj))
	{
		var result = {};
		for (var key in obj)
		{
			result[TemplateEngine.fillIn(key, fields)] = TemplateEngine.fillIn(obj[key], fields);
		}
		return result;
	}

	return obj;
}


XhtmlTemplate = new TemplateEngine();

