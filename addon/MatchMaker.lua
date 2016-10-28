
--
-- Versus
--   by: Ken Cheung
--

require "string";
require "math";
require "lib/lib_PopupWindow";

-- CONSTANTS
local FRAME				= Component.GetFrame("Main");
local POPUP_FRAME		= Component.GetWidget("PopupFrame");
local DISPLAY			= Component.GetWidget("Display");
local MATCH_LIST		= Component.GetWidget("list");

local MATCH_HEIGHT		= 48;

-- VARIABLES

local g_matchtypes = {}

-- pvp list will be hardcoded for now, until we get support for dynamic lists
local d_pvpList =	{
						{ name="Moisture Farm", type="TDM", matchId=0 },
						{ name="Sunken Harbor", type="TDM", matchId=1 },
						{ name="OCT", type="Assault", matchId=2 },
						{ name="Harvester", type="HTP", matchId=3 },
					};

local w_WindowFrame = nil;

function OnComponentLoad()
	w_WindowFrame = PopupWindow.Create(POPUP_FRAME);
	w_WindowFrame:SetTitle(Component.LookupText("PVP_MATCHMAKING_LIST_TITLE"));
	w_WindowFrame.GROUP:EatMice(false);
	w_WindowFrame.BODY.GROUP:SetClipChildren(false);
	Component.FosterWidget( DISPLAY, w_WindowFrame:GetBody(), "full");
	
	InitDisplay();
end

function InitDisplay()
	for i = 1, #d_pvpList do
		local matchTab = g_matchtypes[d_pvpList[i].type];
		if( matchTab == nil ) then
			--create match type tab
			matchTab = {GROUP = Component.CreateWidget("MatchTypeEntry", MATCH_LIST) };
			matchTab.TITLE = matchTab.GROUP:GetChild( "title" );
			matchTab.DESC = matchTab.GROUP:GetChild( "description" );
			matchTab.CHECKBOX = matchTab.GROUP:GetChild( "MatchType_Checkbox" );
			matchTab.ENTRIES = matchTab.GROUP:GetChild( "MatchEntries" );
			matchTab.MATCHES = {};
			
			matchTab.GROUP:SetDims( "left:0; right:100%; top:0; height:40" );
			matchTab.GROUP:SetTag( d_pvpList[i].type );
			
			matchTab.TITLE:SetText( d_pvpList[i].type );
			
			g_matchtypes[d_pvpList[i].type] = matchTab;
		end
		
		--add map to matchTab
		local match = matchTab.MATCHES[d_pvpList[i].name];
		if( match == nil ) then
			match = {GROUP = Component.CreateWidget("MatchEntry", matchTab.ENTRIES) };
			
			match.TITLE = match.GROUP:GetChild( "title" );
			match.DESC = match.GROUP:GetChild( "description" );
			match.CHECKBOX = match.GROUP:GetChild( "Match_Checkbox" );			
			match.TITLE:SetText( d_pvpList[i].name );
			match.GROUP:SetTag( d_pvpList[i].matchId );
			match.GROUP:SetDims("left:0; right:100%; top:"..(matchTab.ENTRIES:GetChildCount()*MATCH_HEIGHT).."; height:"..MATCH_HEIGHT )
			
			matchTab.MATCHES[d_pvpList[i].matchId] = match;
			matchTab.DESC:SetText( matchTab.ENTRIES:GetChildCount()..Component.LookupText("NUMBER_AVAILIBLE_MAPS", matchTab.ENTRIES:GetChildCount() ) )
			
			-- resize the match list to include the new match type
			matchTab.ENTRIES:SetDims( "left:_; right:_; top:_; height:"..(matchTab.ENTRIES:GetChildCount()*MATCH_HEIGHT) )
		end
	end
end

function nothing()
	Game.GetPvPList();
end

function OnToggle(arg)
	if (hasFocus == arg.show) then
		return;
	end
	if (arg.show) then
		hasFocus = true;
		Component.SetInputMode("cursor");
		FRAME:Show(true);
		
		
	else
		hasFocus = false;
		FRAME:Show(false);
		Component.SetInputMode("default");
	end
end

function OnEvent(args)
	if (args.type == "show") then
		OnToggle({show=true});
	elseif (args.type == "hide") then
		OnToggle({show=false});
	elseif (args.type == "toggle") then
		OnToggle({show=(not hasFocus)});
	elseif (args.type == "pvp_requeue") then
		OnToggle({show=(not hasFocus)});
	end
end

function OnEscape(arg)
	OnToggle({show=false});
end

local runningCheckUpdate = false;
local settingChecks = false;
function OnMatchTypeCheckbox(arg)
	local matchTab = g_matchtypes[arg.widget:GetParent():GetTag()];
	local checked = arg.widget:GetCheck();
	
	for key, value in pairs(matchTab.MATCHES) do
		value.CHECKBOX:SetCheck( checked );
	end
end

function OnMatchCheckbox()
	--[[ Should uncheck the matchtype if one of its entries is unchecked
	for matchType, matchTab in pairs( g_matchtypes ) do
		local checked = true
		for key, value in pairs(matchTab.MATCHES) do
			if( not value.CHECKBOX:GetCheck( ) ) then
				checked = false;
				break;
			end
		end
		--matchTab.CHECKBOX:SetCheck( checked );
	end
	--]]
end

function OnMatchQueue()
	local matches = {}
	
	for matchType, matchTab in pairs( g_matchtypes ) do
		for key, value in pairs(matchTab.MATCHES) do
			if( value.CHECKBOX:GetCheck( ) ) then
				matches[ tostring(value.GROUP:GetTag())] = {};
			end
		end
	end
	--og( tostring( matches ) );
end

function OnMatchUnqueue()
	Game.QueueForPvP({}, false);
end

function OnAutoReQueue( arg )
	Component.GenerateEvent("MY_MATCHMAKER_MESSAGE_HANDLER", {action="auto_requeue", value=arg.widget:GetCheck()} );
end

-------------------------------

-- expand/reduce the match tab
function OnMatchTypeClick( arg )
	local matchTab = g_matchtypes[arg.widget:GetParent():GetTag()];	
	if( matchTab.ENTRIES:IsVisible() ) then
		matchTab.ENTRIES:Hide();
		matchTab.GROUP:SetDims( "left:0; right:100%; top:0; height:40"  )
	else
		matchTab.ENTRIES:Show();
		matchTab.GROUP:SetDims( "left:0; right:100%; top:0; height:"..(40+matchTab.ENTRIES:GetChildCount()*MATCH_HEIGHT)  )
	end
end

function GetFocus_MatchTypeEntry()
end

function LoseFocus_MatchTypeEntry()
end

------------------------------------	

function OnMatchQueueResponse()
end
