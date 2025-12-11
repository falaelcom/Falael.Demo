//	R0Q1/daniel/20220824
"use strict";

const { Type } = require("-/pb/natalis/000/Native.js");
const { ArgumentException } = require("-/pb/natalis/003/Exception.js");

module.exports = {};

//	Class: A static collection of mathematical angle-, longitude- and latitude maipulation functions.
const Angle = module.exports.Angle =
{
    //  Function: `normalize(angle: number): number` - calculates a decimal degrees angle in the open interval (-360, 360) that is congruent to `angle` by removing extra revolutions from a decimal `angle`.
    //  Parameter: `angle: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: A number in the open interval (-360, 360) representing the angle in decimal degrees.
    //  Remarks: A positive `angle` and return value map clockwise, a negative `angle` and return value map counterclockwise.
    normalize(angle)
    {
        if (PB_DEBUG)
        {
            if (!Type.isNumber(angle)) throw new ArgumentException(0xD7683A, "angle", angle);
        }
        //  the degrees minus all complete 360 degree rotations - constrain result to the open interval (-360, 360)
        return angle % 360;
    },

    //  Function: `degrees(angle: number): integer` - calculates an integer in the open interval (-360, 360) representing the degrees part of the `angle`'s DMS format.
    //  Parameter: `angle: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: An integer in the open interval (-360, 360) representing the degrees part of the `angle`'s DMS format.
    //  Remarks: A positive value maps clockwise, a negative value maps counterclockwise.
    degrees(angle) { return Math.trunc(Angle.normalize(angle)) },

    //  Function: `minutes(angle: number): integer` - calculates an integer in the closed interval [0, 59] representing the minutes part of the `angle`'s DMS format.
    //  Parameter: `angle: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: An integer in the closed interval [0, 59] representing the minutes part of the `angle`'s DMS format.
    minutes(angle) { return Math.trunc(60 * Math.abs(Angle.normalize(angle) - Angle.degrees(angle))) },

    //  Function: `seconds(angle: number): integer` - calculates an integer in the closed interval [0, 59] representing the seconds part of the `angle`'s DMS format.
    //  Parameter: `angle: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: An integer in the closed interval [0, 59] representing the seconds part of the `angle`'s DMS format.
    seconds(angle) { return Math.trunc(3600 * Math.abs(Angle.normalize(angle) - Angle.degrees(angle)) - 60 * Angle.minutes(angle)) },

    //  Function: `revolutions(angle: number): integer` - calculates an integer representing the count of revolutions exceeding the normal form of the `angle`.
    //      (i.e.an angle of 60 degrees yields 0 revolutions and of 360 or -360 degrees yields 1).
    //  Parameter: `angle: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: A non-negative integer representing the count of revolutions exceeding the normal form of the `angle`
    revolutions(angle) { return Math.abs(Math.trunc(angle / 360)) },

    //  Function: `distance(left: number, right: number): number` - calculates the shortest angular absolute distance between two points on a circle defined by the angular values of `left` and `right`
    //      and returns a value in the closed interval [0, 180].
    //  Parameter: `left: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Parameter: `right: number` - any number in the interval (-Infinity, Infinity) representing in decimal degrees a clockwise (positive value) or counterclockwise (negative value) angle with an
    //      arbitrary number of revolutions.
    //  Returns: The angular distance between angles `left` and `right` represented as a non-negative number in the closed interval [0, 180].
    //  Remarks: The return value represents the shortest angular absolute distance between two points on a circle defined by the angular values of `left` and `right` in the closed interval [0, 180].
    //      Ignores direction.
    //  See also: https://stackoverflow.com/a/12234633/4151043
    distance(left, right)
    {
        if (PB_DEBUG)
        {
            if (!Type.isNumber(left)) throw new ArgumentException(0xF1DBF6, "left", left);
            if (!Type.isNumber(right)) throw new ArgumentException(0x52B856, "right", right);
        }
        return Math.abs((left - right + 180 + 360) % 360 - 180);
    }
};

const Longitude = module.exports.Longitude =
{
    //  Function: `normalize(longitude: number): number` - calculates a longitude in the closed interval [-180, 180], which is congruent to `longitude`.
    //  Parameter: `longitude: number` - any number representing in decimal degrees an East (positive value) or West (negative value) longitude with an arbitrary number of revolutions.
    //  Returns: A number in the closed interval [-180, 180] representing the longitude in decimal degrees.
    //  Remarks: Normal longitude belongs to the closed interval [-180, 180] degrees; a positive value maps East, a negative value maps West. Both values `-180` and `180` designate the same
    //     meredian, namely the antimeredian.
    normalize(longitude)
    {
        if (PB_DEBUG)
        {
            if (!Type.isNumber(longitude)) throw new ArgumentException(0xAEEC32, "longitude", longitude);
        }
        //  the degrees minus all complete rotations of the earth - constrain result to the interval [-360, 360]
        let result = longitude % 360;
        // if the degrees still exceed the bounds, then they are crossing one of the two main meridians.
        if (result < -180 || result > 180)
        {
            // get the sign of the normalized longitude by reversing the current sign
            const sign = -1 * Math.sign(result);
            // get how far away the new point is from 0 degrees; adjust the new point - constrain result to the interval [-180, 180]
            result = sign * Math.abs(360 - Math.abs(result));
        }
        return result;
    },

    //  Function: `degrees(longitude: number): integer` - calculates an integer in the closed interval [-180, 180] representing the degrees part of the longitude's angle DMS format.
    //  Parameter: `longitude: number` - any number representing in decimal degrees an East (positive value) or West (negative value) longitude with an arbitrary number of revolutions.
    //  Returns: An integer in the closed interval [-180, 180] representing the degrees part of the longitude's angle DMS format.
    //  Remarks: A positive return value maps East, a negative return value maps West.
    degrees(longitude) { return Math.trunc(Longitude.normalize(longitude)) },

    //  Function: `minutes(longitude: number): integer` - calculates an integer in the closed interval [0, 59] representing the minutes part of the longitude's angle DMS format.
    //  Parameter: `longitude: number` - any number representing in decimal degrees an East (positive value) or West (negative value) longitude with an arbitrary number of revolutions.
    //  Returns: An an integer in the closed interval [0, 59] representing the minutes part of the longitude's angle DMS format.
    minutes(longitude) { return Math.trunc(60 * Math.abs(Longitude.normalize(longitude) - Longitude.degrees(longitude))) },

    //  Function: `seconds(longitude: number): integer` - calculates an integer in the closed interval [0, 59] representing the seconds part of the longitude's angle DMS format.
    //  Parameter: `longitude: number` - any number representing in decimal degrees an East (positive value) or West (negative value) longitude with an arbitrary number of revolutions.
    //  Returns: An gets an integer in the closed interval [0, 59] representing the seconds part of the longitude's angle DMS format.
    seconds(longitude) { return Math.trunc(3600 * Math.abs(Longitude.normalize(longitude) - Longitude.degrees(longitude)) - 60 * Longitude.minutes(longitude)) },
};

const Latitude = module.exports.Latitude =
{
    //  Function: `normalize(latitude: number): number` - calculates a latitude in the closed interval [-90, 90], which is congruent to `latitude`.
    //  Parameter: `latitude: number` - any number representing in decimal degrees a North (positive value) or South (negative value) latitude with an arbitrary number of revolutions.
    //  Returns: A latitude in decimal degrees in the closed interval [-90, 90], which is congruent to `latitude`.
    //  Remarks: Normal latitude belongs to the interval [-90, +90] degrees; a positive value maps North, a negative value maps South.
    normalize(latitude)
    {
        if (PB_DEBUG)
        {
            if (!Type.isNumber(latitude)) throw new ArgumentException(0x5C2839, "latitude", latitude);
        }
        //  the degrees minus all complete rotations of the earth - constrain result to the interval [-360, 360]
        let result = latitude % 360;
        // check if the point has crossed the equator
        if (result < -180 || result > 180)
        {
            // get the sign of the normalized value by reversing the current sign
            const sign = -1 * Math.sign(result);
            // get how far away the new point is from 0 degrees; adjust the new point - constrain result to the interval [-180, 180]
            result = sign * Math.abs(180 - Math.abs(result));
        }
        // if the degrees are still out of the normal range, handle wrapping the pole
        if (result < -90 || result > 90)
        {
            // get the distance from the equator measured wrapping around the pole, but keep the sign - constrain result to the interval [-90, 90]
            result = Math.sign(result) * Math.abs(180 - Math.abs(result));
        }
        return result;
    },

    //  Function: `degrees(latitude: number): integer` - calculates an integer in the closed interval [-90, 90] representing the degrees part of the latitude's angle DMS format.
    //  Parameter: `latitude: number` - any number representing in decimal degrees a North (positive value) or South (negative value) latitude with an arbitrary number of revolutions.
    //  Returns: An integer in the closed interval [-90, 90] representing the degrees part of the latitude's angle DMS format.
    //  Remarks: A positive return value maps East, a negative return value maps West.
    degrees(latitude) { return Math.trunc(Latitude.normalize(latitude)) },

    //  Function: `minutes(latitude: number): integer` - calculates an integer in the closed interval [0, 59] representing the minutes part of the latitude's angle DMS format.
    //  Parameter: `latitude: number` - any number representing in decimal degrees a North (positive value) or South (negative value) latitude with an arbitrary number of revolutions.
    //  Returns: An an integer in the closed interval [0, 59] representing the minutes part of the latitude's angle DMS format.
    minutes(latitude) { return Math.trunc(60 * Math.abs(Latitude.normalize(latitude) - Latitude.degrees(latitude))) },

    //  Function: `seconds(latitude: number): integer` - calculates an integer in the closed interval [0, 59] representing the seconds part of the latitude's angle DMS format.
    //  Parameter: `latitude: number` - any number representing in decimal degrees a North (positive value) or South (negative value) latitude with an arbitrary number of revolutions.
    //  Returns: An gets an integer in the closed interval [0, 59] representing the seconds part of the latitude's angle DMS format.
    seconds(latitude) { return Math.trunc(3600 * Math.abs(Latitude.normalize(latitude) - Latitude.degrees(latitude)) - 60 * Latitude.minutes(latitude)) },
};

module.exports.MathEx = module.exports;
