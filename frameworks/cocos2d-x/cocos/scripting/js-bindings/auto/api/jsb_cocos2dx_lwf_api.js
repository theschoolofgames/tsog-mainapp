/**
 * @module cocos2dx_lwf
 */
var cc = cc || {};

/**
 * @class LWFBitmap
 */
cc.LWFBitmap = {

/**
 * @method GetBitmap
 * @return {LWF::Bitmap}
 */
GetBitmap : function (
)
{
    return map_object;
},

/**
 * @method GetBitmapEx
 * @return {LWF::BitmapEx}
 */
GetBitmapEx : function (
)
{
    return map_object;
},

};

/**
 * @class LWFNode
 */
cc.LWFNode = {

/**
 * @method isDestructed
 * @return {bool}
 */
isDestructed : function (
)
{
    return false;
},

/**
 * @method getTextureLoadHandler
 * @return {function}
 */
getTextureLoadHandler : function (
)
{
    return std::function<std::basic_string<char> (std::basic_string<char>, std::basic_string<char>, std::basic_string<char>)>;
},

/**
 * @method handleTouch
 * @param {cc.Touch} arg0
 * @param {cc.Event} arg1
 * @return {bool}
 */
handleTouch : function (
touch, 
event 
)
{
    return false;
},

/**
 * @method getNodeHandlers
 * @return {cc.LWFNodeHandlers}
 */
getNodeHandlers : function (
)
{
    return cc.LWFNodeHandlers;
},

/**
 * @method requestRemoveFromParent
 */
requestRemoveFromParent : function (
)
{
},

/**
 * @method removeNodeFromParent
 * @param {cc.Node} arg0
 */
removeNodeFromParent : function (
node 
)
{
},

/**
 * @method dump
 */
dump : function (
)
{
},

/**
 * @method LWFNode
 * @constructor
 */
LWFNode : function (
)
{
},

};

/**
 * @class LWFSprite
 */
cc.LWFSprite = {

/**
 * @method create
 * @param {String} arg0
 * @return {h102::LWFSprite}
 */
create : function (
str 
)
{
    return h102::LWFSprite;
},

/**
 * @method LWFSprite
 * @constructor
 */
LWFSprite : function (
)
{
},

};
