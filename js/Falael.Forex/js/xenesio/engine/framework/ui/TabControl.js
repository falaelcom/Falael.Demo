"use strict";

include("StdAfx.js");

include("framework/tabControlVisual.plain.css")

class TabControl extends PanelVisual
{
	constructor(style, instanceCssClass, id)
	{
		super(style, "tabControl " + instanceCssClass, id);

		this._tabPages = new Collection(this._tabPages_change.bind(this));
		this._selectedTabPageKey = null;

		this._navigationPanel = null;
		this._multiView = null;
		this._buttons = new ControlCollection();
		this._panels = new ControlCollection();

		this._tabChannging = new MulticastDelegate();
		this._tabChannged = new MulticastDelegate();
	}


	__refresh()
	{
		this._navigationPanel.refresh();
		this._multiView.refresh();
	}

	__onRendered()
	{
		this._navigationPanel = new PanelVisual(this.style, "tabControlNavigationPanel " + this._id + "_navigationPanel", this._id + "_navigationPanel");
		this._navigationPanel.render(this.backplane);

		this._multiView = new MultiViewVisual(this.style, "tabControlMultiView " + this._id + "_multiView", this._id + "_multiView");
		this._multiView.selectedControlChange.add(this._multiView_selectedControlChange.bind(this));
		this._multiView.render(this.backplane);
	}

	__onEnabledChanged(value)
	{
		this._navigationPanel.enabled = value;
		this._multiView.enabled = value;
	}


	_tabPages_change(sender, args)
	{
		var tabPage = args.item;
		var panelKey = this.id + "_tabPagePanel_" + tabPage.key;
		var buttonKey = this.id + "_tabButton_" + tabPage.key;
		switch (args.changeType)
		{
			case "add":
				var panel = new PanelVisual(this.style, "tabPanel " + panelKey, panelKey);
				panel.tag = tabPage;
				this._panels.add(panel);

				var button = new Button("textButton", "tabButton " + buttonKey, buttonKey);
				button.suspendRefresh();
				button.tag = panel;
				button.text = tabPage.title;
				button.render(this._navigationPanel.backplane);
				button.resumeRefresh();
				button.refresh();
				button.click.add(this._button_click.bind(this));
				this._buttons.add(button);

				if (tabPage.prerender)
				{
					panel.render(this._multiView.backplane);
					tabPage.render(panel.backplane);
					panel.visible = false;
					panel.refresh();
				}

				break;
			case "remove":
				this._panels.removeById(panelKey);
				this._buttons.removeById(buttonKey);
				break;
			default:
				throw new "Not implemented.";
		}
		this.setDirty("tabPages");
	}

	async _button_click(sender, args)
	{
		var panel = sender.tag;
		var tabPage = panel.tag;

		if (this._selectedTabPageKey == tabPage.key) return;

		var oldTabPage = this._multiView.selectedControl ? this._multiView.selectedControl.tag : null;

		var oldValue = oldTabPage ? 
		{
			key: oldTabPage.key,
			title: oldTabPage.title,
			panel: this._multiView.selectedControl,
		} : null;
		var newValue =
		{
			key: tabPage.key,
			title: tabPage.title,
			panel: panel,
		};
		this._selectedTabPageKey = tabPage.key;

		this.onTabChannging({ oldValue: oldValue, newValue: newValue });
		this._multiView.selectedControl = panel;
		this.onTabChannged({ oldValue: oldValue, newValue: newValue });

		if (oldTabPage)
		{
			var oldButtonKey = this.id + "_tabButton_" + oldTabPage.key;
			var oldButton = this._buttons.getById(oldButtonKey);
			oldButton.checkedState = ButtonVisual.CheckedState.Unchecked;
		}

		var buttonKey = this.id + "_tabButton_" + tabPage.key;
		var button = this._buttons.getById(buttonKey);
		button.checkedState = ButtonVisual.CheckedState.Checked;
	}

	async _multiView_selectedControlChange(sender, args)
	{
		var tabPage = args.value.tag;
		var panel = this._multiView.selectedControl;
		if (!panel.rendered)
		{
			panel.render(this._multiView.backplane);
			tabPage.render(panel.backplane);
		}
		this._multiView.refresh();
	}

	//	tabPages:  [{key, title, render, prerender}]
	get tabPages()
	{
		return this._tabPages;
	}

	get selectedTabPageKey()
	{
		return this._selectedTabPageKey;
	}

	set selectedTabPageKey(value)
	{
		if (this._selectedTabPageKey == value) return;

		var panelKey = this.id + "_tabPagePanel_" + value;
		var panel = this._panels.getById(panelKey);
		var tabPage = panel.tag;
		var oldTabPage = this._multiView.selectedControl ? this._multiView.selectedControl.tag : null;

		var oldValue = oldTabPage ? 
		{
			key: oldTabPage.key,
			title: oldTabPage.title,
			panel: this._multiView.selectedControl,
		} : null;
		var newValue =
		{
			key: tabPage.key,
			title: tabPage.title,
			panel: panel,
		};
		this._selectedTabPageKey = tabPage.key;

		this.onTabChannging({ oldValue: oldValue, newValue: newValue });
		this._multiView.selectedControl = panel;
		this.onTabChannged({ oldValue: oldValue, newValue: newValue });

		if (oldTabPage)
		{
			var oldButtonKey = this.id + "_tabButton_" + oldTabPage.key;
			var oldButton = this._buttons.getById(oldButtonKey);
			oldButton.checkedState = ButtonVisual.CheckedState.Unchecked;
		}

		var buttonKey = this.id + "_tabButton_" + value;
		var button = this._buttons.getById(buttonKey);
		button.checkedState = ButtonVisual.CheckedState.Checked;
	}


	onTabChannging(args)
	{
		this._tabChannging.execute(this, args);
	}

	get tabChannging()
	{
		return this._tabChannging;
	}


	onTabChannged(args)
	{
		this._tabChannged.execute(this, args);
	}

	get tabChannged()
	{
		return this._tabChannged;
	}
}
