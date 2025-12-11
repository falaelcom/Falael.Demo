"use strict";

include("StdAfx.js");
include("combat1.0/Combat1_0_Controller.js");

include("combat1.0/combat1.0.css");
include("book.css");

include("combat1_0Layout", "combat1.0/layout.xhtml");
include("combat1_0Turn", "combat1.0/turn.xhtml");

include("combat1_0Message_PlayerAttack", "combat1.0/message_PlayerAttack.xhtml");
include("combat1_0Message_PlayerDiceRoll", "combat1.0/message_PlayerDiceRoll.xhtml");
include("combat1_0Message_PlayerDamage", "combat1.0/message_PlayerDamage.xhtml");
include("combat1_0Message_PlayerMiss", "combat1.0/message_PlayerMiss.xhtml");
include("combat1_0Message_PlayerHealthChange", "combat1.0/message_PlayerHealthChange.xhtml");
include("combat1_0Message_PlayerIsDead", "combat1.0/message_PlayerIsDead.xhtml");

include("combat1_0Message_EnemyAttack", "combat1.0/message_EnemyAttack.xhtml");
include("combat1_0Message_EnemyDiceRoll", "combat1.0/message_EnemyDiceRoll.xhtml");
include("combat1_0Message_EnemyDamage", "combat1.0/message_EnemyDamage.xhtml");
include("combat1_0Message_EnemyMiss", "combat1.0/message_EnemyMiss.xhtml");
include("combat1_0Message_EnemyHealthChange", "combat1.0/message_EnemyHealthChange.xhtml");
include("combat1_0Message_EnemyIsDead", "combat1.0/message_EnemyIsDead.xhtml");

include("combat1_0Turn_Attack_Player", "combat1.0/turn_Attack_Player.xhtml");
include("combat1_0Turn_Attack_Enemy", "combat1.0/turn_Attack_Enemy.xhtml");
include("combat1_0Turn_AttackActionRow_PlayerContinue", "combat1.0/turn_AttackActionRow_PlayerContinue.xhtml");
include("combat1_0Turn_AttackActionRow_EnemyContinue", "combat1.0/turn_AttackActionRow_EnemyContinue.xhtml");
include("combat1_0Turn_AttackActionRow_Enemy", "combat1.0/turn_AttackActionRow_Enemy.xhtml");
include("combat1_0Turn_AttackActionRow_Player", "combat1.0/turn_AttackActionRow_Player.xhtml");
include("combat1_0Turn_Options", "combat1.0/turn_Options.xhtml");

function Combat1_0_View(playerDocument)
{
	this.playerDocument = playerDocument;

	this.container = null;

	this.controller = new Combat1_0_Controller(playerDocument);
}

Combat1_0_View.prototype.render = function (container)
{
	this.container = container;
}

Combat1_0_View.prototype.refresh = function (onXmlTag)
{
	var combat1_0State = this.playerDocument.getCurrentCombat1_0State();

	var history = [];
	var lastPlayerOptions = null;
	var lastEnemyOptions = null;
	for (var length = combat1_0State.combatHistory.items.length, i = 0; i < length; ++i)
	{
		var combatHistoryItem = Object.copy(combat1_0State.combatHistory.items[i]);
		history.push(combatHistoryItem);
		switch (combatHistoryItem.subject)
		{
			case "playerOptions":
				lastPlayerOptions = combatHistoryItem;
				break;
			case "enemyOptions":
				lastEnemyOptions = combatHistoryItem;
				break;
			case "playerAttack":
				lastPlayerOptions.enemyHpDelta = combatHistoryItem.enemyHpDelta;
				lastPlayerOptions.playerHitPower = combatHistoryItem.playerHitPower;
				break;
			case "enemyAttack":
				lastEnemyOptions.playerHpDelta = combatHistoryItem.playerHpDelta;
				lastEnemyOptions.enemyHitPower = combatHistoryItem.enemyHitPower;
				break;
			default:
				throw "Not implemented.";
		}
	}

	var turnListSb = [];

	var firstIndexToDisplay;
	if(history.length <= 2)
	{
		firstIndexToDisplay = 0;
	}
	else
	{
		firstIndexToDisplay = history.length - 2 + (history.length % 2);
	}

	for (var length = history.length, i = firstIndexToDisplay; i < length; ++i)
	{
		var combatHistoryItem = history[i];

		var messageMergeFields =
		{
			enemyName: combat1_0State.name,
			playerHitPower: combatHistoryItem.playerHitPower,
			playerHpChange: -combatHistoryItem.playerHpDelta,
			enemyHitPower: combatHistoryItem.enemyHitPower,
			enemyHpChange: -combatHistoryItem.enemyHpDelta,
			diceRoll: combatHistoryItem.diceRoll,
		}

		var messageListSb = [];
		var turnFill = null;
		switch (combatHistoryItem.subject)
		{
			case "playerOptions":
				messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerAttack", messageMergeFields).xhtml);
				turnFill = XhtmlTemplate.fill("combat1_0Turn_Options",
				{
					partyLeft_image: "sir-wolf-avatar.png",
					roleCssLeft: "attacker",
					partyLeft_damageLevel: Combat1_0_View.getDamageLevelKey(0),
					attackDirection: "leftToRight",
					partyRight_image: combat1_0State.image,
					roleCssRight: "defender",
					partyRight_damageLevel: Combat1_0_View.getDamageLevelKey(combatHistoryItem.playerHitPower / combat1_0State.enemyOriginalHp),

					messageList: messageListSb.join(""),
				});
				break;
			case "enemyOptions":
				messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyAttack", messageMergeFields).xhtml);
				turnFill = XhtmlTemplate.fill("combat1_0Turn_Options",
				{
					partyLeft_image: "sir-wolf-avatar.png",
					roleCssLeft: "defender",
					partyLeft_damageLevel: Combat1_0_View.getDamageLevelKey(combatHistoryItem.enemyHitPower / combat1_0State.playerOriginalHp),
					attackDirection: "rightToLeft",
					partyRight_image: combat1_0State.image,
					roleCssRight: "attacker",
					partyRight_damageLevel: Combat1_0_View.getDamageLevelKey(0),

					messageList: messageListSb.join(""),
				});
				break;
			case "playerAttack":
				messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerDiceRoll", messageMergeFields).xhtml);
				if (combatHistoryItem.playerHitPower != 0)
				{
					messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerDamage", messageMergeFields).xhtml);
					if (!combatHistoryItem.isEnemyDead)
					{
						messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyHealthChange", messageMergeFields).xhtml);
					}
					else
					{
						messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyIsDead", messageMergeFields).xhtml);
					}
				}
				else
				{
					messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerMiss", messageMergeFields).xhtml);
				}

				var twoDiceRolls = PlayerDocument_Chaos.splitDiceRollInTwo(combatHistoryItem.diceRoll);
				var diceFill = XhtmlTemplate.fill("2dicesView",
				{
					dice1: twoDiceRolls.dice1,
					dice2: twoDiceRolls.dice2,
					style: "white",
				});

				turnFill = XhtmlTemplate.fill("combat1_0Turn_Attack_Player",
				{
					diceView: diceFill.xhtml,

					messageList: messageListSb.join(""),
				});
				break;
			case "enemyAttack":
				messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyDiceRoll", messageMergeFields).xhtml);
				if (combatHistoryItem.enemyHitPower != 0)
				{
					messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyDamage", messageMergeFields).xhtml);
					if (!combatHistoryItem.isPlayerDead)
					{
						messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerHealthChange", messageMergeFields).xhtml);
					}
					else
					{
						messageListSb.push(XhtmlTemplate.fill("combat1_0Message_PlayerIsDead", messageMergeFields).xhtml);
					}
				}
				else
				{
					messageListSb.push(XhtmlTemplate.fill("combat1_0Message_EnemyMiss", messageMergeFields).xhtml);
				}

				var twoDiceRolls = PlayerDocument_Chaos.splitDiceRollInTwo(combatHistoryItem.diceRoll);
				var diceFill = XhtmlTemplate.fill("2dicesView",
				{
					dice1: twoDiceRolls.dice1,
					dice2: twoDiceRolls.dice2,
					style: "black",
				});

				turnFill = XhtmlTemplate.fill("combat1_0Turn_Attack_Enemy",
				{
					diceView: diceFill.xhtml,

					messageList: messageListSb.join(""),
				});
				break;
			default:
				throw "Not implemented.";
		}

		var fill = XhtmlTemplate.fill("combat1_0Turn",
		{
			contents: turnFill.xhtml,
			subject: combatHistoryItem.subject,
		});
		turnListSb.push(fill.xhtml);
	}

	var lastCombatHistoryItem = history[history.length - 1];
	if (!lastCombatHistoryItem.isPlayerDead && !lastCombatHistoryItem.isEnemyDead)
	{
		switch (lastCombatHistoryItem.subject)
		{
			case "playerOptions":
				var fill = XhtmlTemplate.fill("combat1_0Turn_AttackActionRow_Player", { enemyName: combat1_0State.name });
				turnListSb.push(fill.xhtml);
				break;
			case "enemyOptions":
				var fill = XhtmlTemplate.fill("combat1_0Turn_AttackActionRow_Enemy", { enemyName: combat1_0State.name });
				turnListSb.push(fill.xhtml);
				break;
			case "playerAttack":
				var fill = XhtmlTemplate.fill("combat1_0Turn_AttackActionRow_PlayerContinue", { enemyName: combat1_0State.name });
				turnListSb.push(fill.xhtml);
				break;
			case "enemyAttack":
				var fill = XhtmlTemplate.fill("combat1_0Turn_AttackActionRow_EnemyContinue", { enemyName: combat1_0State.name });
				turnListSb.push(fill.xhtml);
				break;
			default:
				throw "Not implemented.";
		}
	}

	var elements = XhtmlTemplate.apply("combat1_0Layout", this.container,
	{
		cardLeft_title: "Player",
		cardLeft_image: "sir-wolf-avatar.png",
		cardLeft_hp: combat1_0State.playerHp,
		cardLeft_might: combat1_0State.playerMight,
		cardLeft_advantage: combat1_0State.playerAdvantage,

		ballanceOfPowers: combat1_0State.ballance,

		cardRight_title: combat1_0State.name,
		cardRight_image: combat1_0State.image,
		cardRight_hp: combat1_0State.hp,
		cardRight_might: combat1_0State.might,
		cardRight_advantage: combat1_0State.enemyAdvantage,

		turnList: turnListSb.join(""),
	});
	elements.layout.onclick = this.layout_onclick.bind(this);

	if (lastCombatHistoryItem.isPlayerDead)
	{
		var text = this.playerDocument.bookDocument.getTextDef(combat1_0State.playerDefeatTextId);
		if (!text)
		{
			console.error("Text def with id \"" + combat1_0State.playerVictoryTextId + "\" not found (1).");
		}
		else
		{
			this.container.innerHTML += GameView.formatText(text, {}, null, onXmlTag);
		}
	}
	else if (lastCombatHistoryItem.isEnemyDead)
	{
		var text = this.playerDocument.bookDocument.getTextDef(combat1_0State.playerVictoryTextId);
		if (!text)
		{
			console.error("Text def with id \"" + combat1_0State.playerVictoryTextId + "\" not found (2).");
		}
		else
		{
			this.container.innerHTML += GameView.formatText(text, {}, null, onXmlTag);
		}
	}
}

Combat1_0_View.prototype.layout_onclick = function (e)
{
	e = e || window.event;
	var element = e.target || e.srcElement;
	switch(element.getAttribute("ux-role"))
	{
		case "enemyAttack":
			this.controller.enemyAttack();
			break;
		case "enemyContinue":
			this.controller.enemyContinue();
			break;
		case "playerAttack":
			this.controller.playerAttack();
			break;
		case "playerContinue":
			this.controller.playerContinue();
			break;
	}

	element.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

Combat1_0_View.getDamageLevelKey = function (hpDeltaToOriginalHpRatio)
{
	if (isNaN(hpDeltaToOriginalHpRatio))
	{
		return "none";
	}
	if (hpDeltaToOriginalHpRatio <= 0)
	{
		return "none";
	}
	if (hpDeltaToOriginalHpRatio < 0.33)
	{
		return "small";
	}
	if (hpDeltaToOriginalHpRatio < 0.66)
	{
		return "medium";
	}
	return "huge";
}
