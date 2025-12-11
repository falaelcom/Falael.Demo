"use strict";

////////////////////////////////////////////
//	Utility
if(!("Utility" in window)) window.Utility = {};

////////////////////////////////////////////
//	Utility.IO
if(!Utility.IO) Utility.IO = {};

Utility.IO.getIsRemote = function()
{
	switch(window.location.protocol) 
	{
	   case 'http:':
	   case 'https:':
		 return true;
	   case 'file:':
		 return false;
	   default: 
		 throw "Not supported";
	}
};

//	mimeType: optional
Utility.IO.readFile = function(file, callback)
{
	var url = file;	
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.onreadystatechange = function() 
	{
        if (request.readyState == 4 || request.readyState == 0)
		{
			if(request.status == "200")
			{
				return callback(null, request.responseText);
			}
			else
			{
				return callback(
				{
					readyState: request.readyState,
					status: request.status,
				}, request.responseText);
			}
        }
    };
	request.send(null);
};

Utility.IO.getDirectory = function(path)
{
	var parts = path.split("/")
    if (parts.length < 2)
    {
        return "";
    }
    var directoryParts = parts.slice(0, parts.length - 1);
    return directoryParts.join('/');
};