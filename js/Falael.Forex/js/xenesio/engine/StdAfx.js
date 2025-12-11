"use strict";

//	vendor
include("vendor/async.min.js");
include("vendor/two.js");
include("vendor/ajv.min.js");
include("vendor/moment.min.js");
include("vendor/moment-timezone-with-data.js");	//	downloaded 12.02.2020
include("vendor/rbtree.js");
include("vendor/cardinal-spline-js-curve_calc.min.js");
include("vendor/taira.js");
include("vendor/discreteFourierTransform.js");
include("vendor/dspUtils.js");

//	framework
include("shared/Exception.js");
include("shared/Queue.js");

include("framework/XenesioException.js");
include("framework/NotImplementedException.js");
include("framework/InvalidOperationException.js");
include("framework/Utility.IO.js");
include("framework/Utility.Type.js");
include("framework/Utility.Format.js");
include("framework/OfflineStorage.js");
include("framework/XhtmlTemplate.js");
include("framework/MulticastDelegate.js");
include("framework/DelegateRegistry.js");
include("framework/Collection.js");
include("framework/Dictionary.js");
include("framework/Deferrer.js");
include("framework/EDateTimeUnit.js");
include("framework/SimpleDuration.js");
include("framework/Sync.js");

include("shared/LinearFunction.js");
include("shared/Range.js");
include("shared/ArrayView.js");
include("shared/ArrayMapper.js");
include("shared/Sample.js");
include("shared/Histogram.js");
include("shared/Simulator.js");
include("shared/DataBuffer.js");
include("shared/HashSet.js");

include("framework/obsolete/MappedArray.js");

include("framework/data/DataQuery.js");
include("framework/data/DataRegion.js");

include("framework/ui/EBrowserEventType.js");
include("framework/ui/Control.js");
include("framework/ui/ControlCollection.js");
include("framework/ui/Behavior.js");
include("framework/ui/TwoGraphicsDevice.js");

include("framework/ui/ButtonVisual.js");
include("framework/ui/ButtonBehavior.js");
include("framework/ui/Button.js");
include("framework/ui/LabelVisual.js");
include("framework/ui/ListViewVisual.js");
include("framework/ui/ListView.js");
include("framework/ui/MultiViewVisual.js");
include("framework/ui/PanelVisual.js");
include("framework/ui/SliderVisual.js");
include("framework/ui/SliderBehavior.js");
include("framework/ui/Slider.js");
include("framework/ui/TabControl.js");
include("framework/ui/ChartVisual.js");

include("framework/http/DionClient.js");
