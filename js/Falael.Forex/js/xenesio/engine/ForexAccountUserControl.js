"use strict";

include("StdAfx.js");

include("ForexAccountUserControl.css");

include("ForexAccountUserControl", "ForexAccountUserControl.xhtml");
include("ForexAccountUserControl.positionListItem", "ForexAccountUserControl.positionListItem.xhtml");

class ForexAccountUserControl extends Control
{
	constructor(id, account)
	{
		super(id);

		this._forexAccountInfoLabel = null;
		this._forexBrokerInfoLabel = null;
		this._currentPositionInfoLabel = null;
		this._buyButton = null;
		this._sellButton = null;

		this._account = account;
		this._defaultQuoteAmount = 100000;

		this._selectedPositionChange = new MulticastDelegate();

		this._positionsListView = null;
		this._positionsListView_closeButtonBehavior = null;
	}


	onSelectedPositionChange(args)
	{
		this._selectedPositionChange.execute(this, args);
	}

	addPosition(position)
	{
		var listViewItem = new ListViewItem(position);
		this._positionsListView.items.add(listViewItem);
		this._positionsListView.selectedItem = listViewItem;
		position["__" + this.id + "_ForexAccountUserControl_listViewItem_id"] = listViewItem.id;
		this.refresh();
	}

	removePosition(position)
	{
		this._positionsListView.items.removeByQuery(item => item.id == position["__" + this.id + "_ForexAccountUserControl_listViewItem_id"]);
		delete position["__" + this.id + "_ForexAccountUserControl_listViewItem_id"];
		this.refresh();
	}

	removeAll()
	{
		var items = this._positionsListView.items.toArray();
		for (var length = items.length, i = 0; i < length; ++i) this.removePosition(items[i].value);
	}

	__render(hostElement)
	{
		var elements = XhtmlTemplate.apply("ForexAccountUserControl", hostElement, null, TemplateEngine.Append);

		this._forexAccountInfoLabel = new LabelVisual("plain", "forexAccountInfoLabel");
		this._forexAccountInfoLabel.suspendRefresh();
		this._forexAccountInfoLabel.render(elements.forexAccountInfoHost);
		this._forexAccountInfoLabel.resumeRefresh();
		this._forexAccountInfoLabel.refresh();

		this._forexBrokerInfoLabel = new LabelVisual("plain", "forexBrokerInfoLabel");
		this._forexBrokerInfoLabel.suspendRefresh();
		this._forexBrokerInfoLabel.render(elements.forexBrokerInfoHost);
		this._forexBrokerInfoLabel.resumeRefresh();
		this._forexBrokerInfoLabel.refresh();

		this._currentPositionInfoLabel = new LabelVisual("plain", "currentPositionInfoLabel");
		this._currentPositionInfoLabel.suspendRefresh();
		this._currentPositionInfoLabel.render(elements.currentPositionsInfoHost);
		this._currentPositionInfoLabel.resumeRefresh();
		this._currentPositionInfoLabel.refresh();

		this._buyButton = new Button("textButton", "buyButton");
		this._buyButton.suspendRefresh();
		this._buyButton.text = "Buy";
		this._buyButton.render(elements.buttonsHost);
		this._buyButton.resumeRefresh();
		this._buyButton.refresh();
		this._buyButton.click.add(this._buyButton_click.bind(this));

		this._sellButton = new Button("textButton", "sellButton");
		this._sellButton.suspendRefresh();
		this._sellButton.text = "Sell";
		this._sellButton.render(elements.buttonsHost);
		this._sellButton.resumeRefresh();
		this._sellButton.refresh();
		this._sellButton.click.add(this._sellButton_click.bind(this));

		this._positionsListView = new ListView("verticalList", "positions", "positionsListView",
		{
			render: this._positionsListView_itemRenderer_render.bind(this),
			refresh: this._positionsListView_itemRenderer_refresh.bind(this),
		});
		this._positionsListView.render(elements.positionsHost);
		this._positionsListView.selectionChange.add(this._positionsListView_selectionChange.bind(this));
		this._positionsListView_closeButtonBehavior = new ButtonBehavior(this._positionsListView.backplane);
		this._positionsListView_closeButtonBehavior.click.add(this._closeButton_click.bind(this));
		this._positionsListView_closeButtonBehavior.enabled = true;
		
		return elements;
	}

	__refresh()
	{
		var sb = [];
		sb.push("Equity: " + String.formatMoney(this._account.equity) + " EUR");
		sb.push("<br />");
		sb.push("Free margin: " + String.formatMoney(this._account.freeMargin) + " EUR");
		sb.push("<br />");
		sb.push("<br />");
		sb.push("Balance: " + String.formatMoney(this._account.balance) + " EUR");
		sb.push("<br />");
		sb.push("Floating amount: " + String.formatMoney(this._account.floatingAmount) + " EUR");
		sb.push("<br />");
		sb.push("Used margin: " + String.formatMoney(this._account.usedMargin) + " EUR");
		sb.push("<br />");
		sb.push("Margin level: " + String.formatMoney(this._account.marginLevelPercent, 0) + "%");
		sb.push("<br />");
		sb.push("<br />");
		sb.push("Quote amaount: " + String.formatMoney(this._defaultQuoteAmount) + " EUR");
		this._forexAccountInfoLabel.text = sb.join("");

		var sb = [];
		sb.push("ask: " + String.formatMoney(this._account.currentAsk, 5) + " EUR");
		sb.push("<br />");
		sb.push("bid: " + String.formatMoney(this._account.currentBid, 5) + " EUR");
		sb.push("<br />");
		sb.push("spread: " + String.formatMoney(this._account.currentSpread, 5) + " EUR");
		sb.push("<br />");
		this._forexBrokerInfoLabel.text = sb.join("");

		this._buyButton.text = "Buy @ " + String.formatMoney(this._account.currentAsk, 5) + " EUR";
		this._sellButton.text = "Sell @ " + String.formatMoney(this._account.currentBid, 5) + " EUR";

		this._positionsListView.refresh();

		if (this._positionsListView.selectedItem)
		{
			var position = this._positionsListView.selectedItem.value;
			var sb = [];
			switch (position.type)
			{
				case EForexPositionType.Long:
					sb.push("Long");
					break;
				case EForexPositionType.Short:
					sb.push("Short");
					break;
				default:
					throw "Not implemented.";
			}
			sb.push(", ");
			sb.push(String.formatMoney(position.quoteAmount) + " EUR");
			sb.push(" @ ");
			sb.push(String.formatMoney(position.entryPrice, 5));
			sb.push("; ");
			sb.push("RM ");
			sb.push(String.formatMoney(position.requiredMargin) + " EUR");
			sb.push(", ");
			sb.push("FA ");
			sb.push(String.formatMoney(position.floatingAmount) + " EUR");
			this._currentPositionInfoLabel.text = sb.join("");
		}
		else
		{
			this._currentPositionInfoLabel.text = "";
		}
	}


	_positionsListView_itemRenderer_render(hostElement, listViewItem)
	{
		var position = listViewItem.value;
		var fields =
		{
			type: null,
			quoteAmount: String.formatMoney(position.quoteAmount),
			entryPrice: String.formatMoney(position.entryPrice, 5),
			requiredMargin: String.formatMoney(position.requiredMargin),
			floatingAmount: String.formatMoney(position.floatingAmount),
		};
		switch (position.type)
		{
			case EForexPositionType.Long:
				fields.type = "Long";
				break;
			case EForexPositionType.Short:
				fields.type = "Short";
				break;
			default:
				throw "Not implemented.";
		}
		var elements = XhtmlTemplate.apply("ForexAccountUserControl.positionListItem", hostElement, fields, TemplateEngine.Replace);

		//	either adapt the button behavior for multiple buttons (mouse enter and mouse leave must be changed to mouse move + hit test)
		//	or simply use multiple Button objects for this list (easier)
		var closeButtonVisual = new ButtonVisual("textButton", "closeButton", listViewItem.id);
		closeButtonVisual.suspendRefresh();
		closeButtonVisual.text = "Close";
		closeButtonVisual.render(elements.closeButtonHost);
		closeButtonVisual.resumeRefresh();
		closeButtonVisual.refresh();

		return elements;
	}

	_positionsListView_itemRenderer_refresh(itemElement, listViewItem)
	{
		listViewItem.__renderCache.itemElements.floatingAmountHost.innerHTML = String.formatMoney(listViewItem.value.floatingAmount);
	}


	_buyButton_click(sender, args)
	{
		var position = this._account.buy(this._defaultQuoteAmount);
		this.addPosition(position);
	}

	_sellButton_click(sender, args)
	{
		var position = this._account.sell(this._defaultQuoteAmount);
		this.addPosition(position);
	}

	_closeButton_click(sender, args)
	{
		var listViewItem = this._positionsListView.getItemById(args.control.id);	//	in _positionsListView_itemRenderer_render the button control id is set to be the same as the list item id
		var position = listViewItem.value;
		this._account.close(position);
		this._positionsListView.items.remove(listViewItem);
		this.refresh();
	}

	_positionsListView_selectionChange(sender, args)
	{
		this.onSelectedPositionChange({ selectedPosition: this.selectedPosition });
		this.refresh();
	}


	get selectedPosition()
	{
		//return this._account.positions[0] || null;
		return this._positionsListView.selectedItem ? this._positionsListView.selectedItem.value : null;
	}

	get selectedPositionChange()
	{
		return this._selectedPositionChange;
	}
}
