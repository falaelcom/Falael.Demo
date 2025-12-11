//  par.operandSchema: [axis1Name, axis2Name, ...]
//  par.resultSchema: [axis1Name, axis2Name, ...]
//  par.operators: array
function SpaceTransformation(par)
{
	this.operandSchema = par.operandSchema;
	this.resultSchema = par.resultSchema;
	this.operators = par.operators;
	this.operandDimensions = par.operandDimensions;
	
	this.resultDimensions = [];
	this.dataTransformations = {};
	this.reverseDimensionMapping = [];

	var operandSchemaMap = {};
	for(var length = this.operandSchema.length, i = 0; i < length; ++i)
	{
		operandSchemaMap[this.operandSchema[i]] = i;
	}
	var resultSchemaMap = {};
	for(var length = this.resultSchema.length, i = 0; i < length; ++i)
	{
		resultSchemaMap[this.resultSchema[i]] = i;
	}

	var operatorContext =
	{
		operandDimensions: this.operandDimensions,
		operandSchema: operandSchemaMap,
		resultSchema: resultSchemaMap,
	};
	var operatorResult =
	{
		resultDimensions: Array(this.resultSchema.length).fill(null),
		reverseDimensionMapping: Array(this.operandDimensions.length).fill(null),
		dataTransformations: {},
	};
	var isEmpty = false;
	for(var length = this.operators.length, i = 0; i < length; ++i)
	{
		if(!this.operators[i].apply(operatorContext, operatorResult))
		{
			isEmpty = true;
			break;
		}
	}
	if(!isEmpty)
	{
		this.dataTransformations = operatorResult.dataTransformations;
		this.resultDimensions = operatorResult.resultDimensions;
		this.reverseDimensionMapping = operatorResult.reverseDimensionMapping;
	}

	this.getResultDimensions = function()
	{
		return this.resultDimensions;
	}

	this.getDataTransformations = function()
	{
		return this.dataTransformations;
	}

	this.getReverseDimensionMapping = function()
	{
		return this.reverseDimensionMapping;
	}

	this.reverseVvector = function(resultVvector)
	{
		var operandVvector = Array(this.operandDimensions.length).fill(-1);
		for(var length = this.reverseDimensionMapping.length, i = 0; i < length; ++i)
		{
			var mapping = this.reverseDimensionMapping[i];
			operandVvector[i] = mapping.map(resultVvector, mapping.data);
		}
		return operandVvector;
	}
}

function SliceOperator(axisName, value, useNearest)
{
	this.axisName = axisName;
	this.value = value;
	this.useNearest = useNearest;

	this.apply = function(operatorContext, operatorResult)
	{
		var operandDimensions = operatorContext.operandDimensions;
		var operandSchema = operatorContext.operandSchema;
		var resultSchema = operatorContext.resultSchema;

		var dimension = operandDimensions[operandSchema[this.axisName]];
		var hitTestResult = dimension.hitTest(this.value, this.useNearest);

		var operandDi = operandSchema[this.axisName];

		operatorResult.dataTransformations[this.axisName] = hitTestResult.v;
		operatorResult.reverseDimensionMapping[operandDi] =
		{
			data: {fixedValue: hitTestResult.v},
			map: function(resultVvector, data)
			{
				return data.fixedValue;
			}
		};

		return true;
	}

	this.getAxisName = function()
	{
		return this.axisName;
	}

	this.getValue = function()
	{
		return this.value;
	}

	this.getUseNearest = function()
	{
		return this.useNearest;
	}
}

function MapOperator(resultAxisName, axisName)
{
	this.resultAxisName = resultAxisName;
	this.axisName = axisName;

	this.apply = function(operatorContext, operatorResult)
	{
		var operandDimensions = operatorContext.operandDimensions;
		var operandSchema = operatorContext.operandSchema;
		var resultSchema = operatorContext.resultSchema;

		var operandDi = operandSchema[this.axisName];
		var resultDi = resultSchema[this.resultAxisName];
		operatorResult.resultDimensions[resultDi] = operandDimensions[operandDi];
		operatorResult.reverseDimensionMapping[operandDi] =
		{
			data: {resultDi: resultDi},
			map: function(resultVvector, data)
			{
				return resultVvector[data.resultDi];
			}
		};
		return true;
	}

	this.getResultAxisName = function()
	{
		return this.resultAxisName;
	}

	this.getAxisName = function()
	{
		return this.axisName;
	}
}

function ProjectionOperator(axisName)
{
	this.axisName = axisName;

	this.apply = function(operatorContext, operatorResult)
	{
		var operandDimensions = operatorContext.operandDimensions;
		var operandSchema = operatorContext.operandSchema;
		var resultSchema = operatorContext.resultSchema;

		var operandDi = operandSchema[this.axisName];

		operatorResult.dataTransformations[this.axisName] = operatorResult.dataTransformations[this.axisName] || {};
		operatorResult.dataTransformations[this.axisName].projection = operandDimensions[operandSchema[this.axisName]];
		operatorResult.reverseDimensionMapping[operandDi] =
		{
			data: {},
			map: function(resultVvector, data)
			{
				throw "Not implemented";
			}
		};
		return true;
	}

	this.getAxisName = function()
	{
		return this.axisName;
	}
}
