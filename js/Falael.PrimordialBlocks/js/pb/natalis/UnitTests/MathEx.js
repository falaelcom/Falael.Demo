//	R0Q2/daniel/20220505
"use strict";

const { Angle, Longitude, Latitude } = require("-/pb/natalis/012/MathEx.Angle.js");

module.exports =

class UnitTests_MathEx
{
	//	Category: Unit test
	//	Function: Run unit tests for `MathEx` class static methods.
	static unitTest_MathEx(result)
	{
		let value, left, right, expected, outcome;

		const test = testName => outcome !== expected ? result.push({ testName, expected, outcome }) : void 0;

		test_MathEx_Angle();
		test_MathEx_Longitude();
		test_MathEx_Latitude();

		function test_MathEx_Angle()
		{
			//	MathEx.Angle.normalize
			value = 0; expected = 0; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.01)");
			value = 1; expected = 1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.02)");
			value = 1.1; expected = 1.1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.021)");
			value = -1.1; expected = -1.1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.031)");
			value = 360; expected = 0; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.04)");
			value = -360; expected = 0; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.05)");
			value = 361; expected = 1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.06)");
			value = 361.1; expected = 1.1; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.061)");
			value = -361; expected = -1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.07)");
			value = -361.1; expected = -1.1; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.071)");
			value = 359; expected = 359; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.08)");
			value = 359.1; expected = 359.1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.081)");
			value = -359; expected = -359; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.09)");
			value = -359.1; expected = -359.1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.091)");
			value = 2 * 360; expected = 0; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.10)");
			value = 2 * -360; expected = 0; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.11)");
			value = 2 * 360 + 1; expected = 1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.12)");
			value = 2 * 360 + 1.1; expected = 1.1; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.121)");
			value = 2 * -360 - 1; expected = -1; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.13)");
			value = 2 * -360 - 1.1; expected = -1.1; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.13)");
			value = 2 * 360 - 1; expected = 359; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.14)");
			value = 2 * 360.1 - 1; expected = 359.2; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.141)");
			value = 2 * -360 + 1; expected = -359; outcome = Angle.normalize(value); test("MathEx.Angle.normalize (01.15)");
			value = 2 * -360.1 + 1; expected = -359.2; outcome = Math.trunc(Angle.normalize(value) * 10) / 10; test("MathEx.Angle.normalize (01.151)");

			//	MathEx.Angle.degrees
			value = 0; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.01)");
			value = 1; expected = 1; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.02)");
			value = 1.1; expected = 1; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.021)");
			value = -1; expected = -1; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.03)");
			value = -1.1; expected = -1; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.031)");
			value = 360; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.04)");
			value = 360.1; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.041)");
			value = -360; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.05)");
			value = -360.1; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.051)");
			value = 359; expected = 359; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.06)");
			value = 359.1; expected = 359; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.061)");
			value = -359; expected = -359; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.07)");
			value = -359.1; expected = -359; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.071)");
			value = 2 * 360; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.08)");
			value = 2 * 360.1; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.081)");
			value = 2 * -360; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.09)");
			value = 2 * -360.1; expected = 0; outcome = Angle.degrees(value); test("MathEx.Angle.degrees (02.091)");

			//	MathEx.Angle.minutes
			value = 0; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.01)");
			value = 1; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.02)");
			value = -1; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.03)");
			value = 1.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.04)");
			value = -1.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.05)");
			value = 1.9999999999; expected = 59; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.06)");
			value = -1.9999999999; expected = 59; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.07)");
			value = 360; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.08)");
			value = -360; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.09)");
			value = 360.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.10)");
			value = -360.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.11)");
			value = 2 * 360; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.12)");
			value = 2 * -360; expected = 0; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.13)");
			value = 2 * 360 + 0.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.14)");
			value = 2 * -360 - 0.5; expected = 30; outcome = Angle.minutes(value); test("MathEx.Angle.minutes (03.15)");

			//	MathEx.Angle.seconds
			value = 0; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.01)");
			value = 1; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.02)");
			value = -1; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.03)");
			value = 0.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.04)");
			value = -0.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.05)");
			value = 1.9999999999; expected = 59; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.06)");
			value = -1.9999999999; expected = 59; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.07)");
			value = 360; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.08)");
			value = -360; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.09)");
			value = 360.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.10)");
			value = -360.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.11)");
			value = 2 * 360; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.12)");
			value = 2 * -360; expected = 0; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.13)");
			value = 2 * 360 + 0.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.14)");
			value = 2 * -360 - 0.008333339; expected = 30; outcome = Angle.seconds(value); test("MathEx.Angle.seconds (04.15)");

			//	MathEx.Angle.revolutions
			value = 0; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.01)");
			value = 1; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.02)");
			value = 1.1; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.021)");
			value = -1.1; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.031)");
			value = 360; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.04)");
			value = -360; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.05)");
			value = 361; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.06)");
			value = 361.1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.061)");
			value = -361; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.07)");
			value = -361.1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.071)");
			value = 359; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.08)");
			value = 359.1; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.081)");
			value = -359; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.09)");
			value = -359.1; expected = 0; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.091)");
			value = 2 * 360; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.10)");
			value = 2 * -360; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.11)");
			value = 2 * 360 + 1; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.12)");
			value = 2 * 360 + 1.1; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.121)");
			value = 2 * -360 - 1; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.13)");
			value = 2 * -360 - 1.1; expected = 2; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.131)");
			value = 2 * 360 - 1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.14)");
			value = 2 * 360.1 - 1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.141)");
			value = 2 * -360 + 1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.15)");
			value = 2 * -360.1 + 1; expected = 1; outcome = Angle.revolutions(value); test("MathEx.Angle.revolutions (05.151)");

			//	MathEx.Angle.distance
			left = 0; right = 0; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.01)");
			left = 1; right = 0; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.02)");
			left = -1; right = 0; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.03)");
			left = 0; right = 1; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.04)");
			left = 0; right = -1; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.05)");
			left = 180; right = 0; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.06)");
			left = -180; right = 0; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.07)");
			left = 0; right = 180; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.08)");
			left = 0; right = -180; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.09)");
			left = 240; right = 0; expected = 120; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.10)");
			left = 0; right = 240; expected = 120; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.11)");
			left = -240; right = 0; expected = 120; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.101)");
			left = 0; right = -240; expected = 120; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.111)");
			left = 360; right = 0; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.12)");
			left = 0; right = 360; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.13)");
			left = -360; right = 0; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.14)");
			left = 0; right = -360; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.15)");
			left = 1; right = 2; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.16)");
			left = 2; right = 1; expected = 1; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.16)");
			left = 180; right = -180; expected = 0; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.17)");
			left = 360; right = 180; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.18)");
			left = -360; right = 180; expected = 180; outcome = Angle.distance(left, right); test("MathEx.Angle.distance (06.19)");
		}

		function test_MathEx_Longitude()
		{
			//	MathEx.Longitude.normalize
			value = 0; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.01)");
			value = 1; expected = 1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.02)");
			value = 1.1; expected = 1.1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.021)");
			value = -1.1; expected = -1.1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.031)");
			value = 180; expected = 180; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (101.01)");
			value = 180.1; expected = -179.9; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (101.011)");
			value = -180; expected = -180; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (101.02)");
			value = -180.1; expected = 179.9; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (101.021)");
			value = 360; expected = 0; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.04)");
			value = -360; expected = 0; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.05)");
			value = 361; expected = 1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.06)");
			value = 361.1; expected = 1.1; outcome = Math.trunc(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.061)");
			value = -361; expected = -1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.07)");
			value = -361.1; expected = -1.1; outcome = Math.trunc(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.071)");
			value = 359; expected = -1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.08)");
			value = 359.1; expected = -0.9; outcome = Math.round(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.081)");
			value = -359; expected = 1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.09)");
			value = -359.1; expected = 0.9; outcome = Math.round(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.091)");
			value = 2 * 360; expected = 0; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.10)");
			value = 2 * -360; expected = 0; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.11)");
			value = 2 * 360 + 1; expected = 1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.12)");
			value = 2 * 360 + 1.1; expected = 1.1; outcome = Math.trunc(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.121)");
			value = 2 * -360 - 1; expected = -1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.13)");
			value = 2 * -360 - 1.1; expected = -1.1; outcome = Math.trunc(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.13)");
			value = 2 * 360 - 1; expected = -1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.14)");
			value = 2 * 360.1 - 1; expected = -0.8; outcome = Math.round(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.141)");
			value = 2 * -360 + 1; expected = 1; outcome = Longitude.normalize(value); test("MathEx.Longitude.normalize (01.15)");
			value = 2 * -360.1 + 1; expected = 0.8; outcome = Math.round(Longitude.normalize(value) * 10) / 10; test("MathEx.Longitude.normalize (01.151)");

			//	MathEx.Longitude.degrees
			value = 0; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.01)");
			value = 1; expected = 1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.02)");
			value = 1.1; expected = 1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.021)");
			value = -1; expected = -1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.03)");
			value = -1.1; expected = -1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.031)");
			value = 360; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.04)");
			value = 360.1; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.041)");
			value = -360; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.05)");
			value = -360.1; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.051)");
			value = 359; expected = -1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.06)");
			value = 359.1; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.061)");
			value = -359; expected = 1; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.07)");
			value = -359.1; expected = 0; outcome = Math.round(Longitude.degrees(value) * 10) / 10; test("MathEx.Longitude.degrees (02.071)");
			value = 2 * 360; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.08)");
			value = 2 * 360.1; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.081)");
			value = 2 * -360; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.09)");
			value = 2 * -360.1; expected = 0; outcome = Longitude.degrees(value); test("MathEx.Longitude.degrees (02.091)");

			//	MathEx.Longitude.minutes
			value = 0; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.01)");
			value = 1; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.02)");
			value = -1; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.03)");
			value = 1.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.04)");
			value = -1.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.05)");
			value = 1.9999999999; expected = 59; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.06)");
			value = -1.9999999999; expected = 59; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.07)");
			value = 360; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.08)");
			value = -360; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.09)");
			value = 360.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.10)");
			value = -360.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.11)");
			value = 2 * 360; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.12)");
			value = 2 * -360; expected = 0; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.13)");
			value = 2 * 360 + 0.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.14)");
			value = 2 * -360 - 0.5; expected = 30; outcome = Longitude.minutes(value); test("MathEx.Longitude.minutes (03.15)");

			//	MathEx.Longitude.seconds
			value = 0; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.01)");
			value = 1; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.02)");
			value = -1; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.03)");
			value = 0.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.04)");
			value = -0.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.05)");
			value = 1.9999999999; expected = 59; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.06)");
			value = -1.9999999999; expected = 59; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.07)");
			value = 360; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.08)");
			value = -360; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.09)");
			value = 360.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.10)");
			value = -360.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.11)");
			value = 2 * 360; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.12)");
			value = 2 * -360; expected = 0; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.13)");
			value = 2 * 360 + 0.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.14)");
			value = 2 * -360 - 0.008333339; expected = 30; outcome = Longitude.seconds(value); test("MathEx.Longitude.seconds (04.15)");
		}

		function test_MathEx_Latitude()
		{
			//	MathEx.Latitude.normalize
			value = 0; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.01)");
			value = 1; expected = 1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.02)");
			value = 1.1; expected = 1.1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.021)");
			value = -1.1; expected = -1.1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.031)");
			value = 90; expected = 90; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (201.01)");
			value = 90.1; expected = 89.9; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (201.011)");
			value = -90; expected = -90; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (201.02)");
			value = -90.1; expected = -89.9; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (201.021)");
			value = 180; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (101.01)");
			value = 180.1; expected = -0.1; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (101.011)");
			value = -180; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (101.02)");
			value = -180.1; expected = 0.1; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (101.021)");
			value = 360; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.04)");
			value = -360; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.05)");
			value = 361; expected = 1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.06)");
			value = 361.1; expected = 1.1; outcome = Math.trunc(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.061)");
			value = -361; expected = -1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.07)");
			value = -361.1; expected = -1.1; outcome = Math.trunc(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.071)");
			value = 359; expected = -1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.08)");
			value = 359.1; expected = -0.9; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.081)");
			value = -359; expected = 1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.09)");
			value = -359.1; expected = 0.9; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.091)");
			value = 2 * 360; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.10)");
			value = 2 * -360; expected = 0; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.11)");
			value = 2 * 360 + 1; expected = 1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.12)");
			value = 2 * 360 + 1.1; expected = 1.1; outcome = Math.trunc(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.121)");
			value = 2 * -360 - 1; expected = -1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.13)");
			value = 2 * -360 - 1.1; expected = -1.1; outcome = Math.trunc(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.13)");
			value = 2 * 360 - 1; expected = -1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.14)");
			value = 2 * 360.1 - 1; expected = -0.8; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.141)");
			value = 2 * -360 + 1; expected = 1; outcome = Latitude.normalize(value); test("MathEx.Latitude.normalize (01.15)");
			value = 2 * -360.1 + 1; expected = 0.8; outcome = Math.round(Latitude.normalize(value) * 10) / 10; test("MathEx.Latitude.normalize (01.151)");

			//	MathEx.Latitude.degrees
			value = 0; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.01)");
			value = 1; expected = 1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.02)");
			value = 1.1; expected = 1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.021)");
			value = -1; expected = -1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.03)");
			value = -1.1; expected = -1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.031)");
			value = 360; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.04)");
			value = 360.1; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.041)");
			value = -360; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.05)");
			value = -360.1; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.051)");
			value = 359; expected = -1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.06)");
			value = 359.1; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.061)");
			value = -359; expected = 1; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.07)");
			value = -359.1; expected = 0; outcome = Math.round(Latitude.degrees(value) * 10) / 10; test("MathEx.Latitude.degrees (02.071)");
			value = 2 * 360; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.08)");
			value = 2 * 360.1; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.081)");
			value = 2 * -360; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.09)");
			value = 2 * -360.1; expected = 0; outcome = Latitude.degrees(value); test("MathEx.Latitude.degrees (02.091)");

			//	MathEx.Latitude.minutes
			value = 0; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.01)");
			value = 1; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.02)");
			value = -1; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.03)");
			value = 1.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.04)");
			value = -1.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.05)");
			value = 1.9999999999; expected = 59; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.06)");
			value = -1.9999999999; expected = 59; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.07)");
			value = 360; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.08)");
			value = -360; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.09)");
			value = 360.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.10)");
			value = -360.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.11)");
			value = 2 * 360; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.12)");
			value = 2 * -360; expected = 0; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.13)");
			value = 2 * 360 + 0.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.14)");
			value = 2 * -360 - 0.5; expected = 30; outcome = Latitude.minutes(value); test("MathEx.Latitude.minutes (03.15)");

			//	MathEx.Latitude.seconds
			value = 0; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.01)");
			value = 1; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.02)");
			value = -1; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.03)");
			value = 0.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.04)");
			value = -0.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.05)");
			value = 1.9999999999; expected = 59; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.06)");
			value = -1.9999999999; expected = 59; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.07)");
			value = 360; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.08)");
			value = -360; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.09)");
			value = 360.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.10)");
			value = -360.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.11)");
			value = 2 * 360; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.12)");
			value = 2 * -360; expected = 0; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.13)");
			value = 2 * 360 + 0.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.14)");
			value = 2 * -360 - 0.008333339; expected = 30; outcome = Latitude.seconds(value); test("MathEx.Latitude.seconds (04.15)");
		}
	}
}

module.exports.UnitTests_MathEx = module.exports;
