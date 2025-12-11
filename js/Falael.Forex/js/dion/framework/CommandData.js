"use strict";

module.exports =

//  {
//      fields: {field: <value>, field: <value>, ...},
//      files: [{namespace: "upload", name: "<originalFileName>", path: "<upload/path/physicalFileName>", size: <fileSize>}, ...],
//      document: "<a javascript object containing a deserialized payload like json or xml>"
//  }
class CommandData
{
    constructor()
    {
        this.fields = {};
		this.files = [];
		this.document = null;
    }
}
