/**
 * @module lwf
 */
var lwf = lwf || {};

/**
 * @class LWFBitmap
 */
lwf.Bitmap = {

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
lwf.Node = {

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
 * @class LWFParticle
 */
lwf.Particle = {

/**
 * @method GetParticle
 * @return {LWF::Particle}
 */
GetParticle : function (
)
{
    return LWF::Particle;
},

};

/**
 * @class LWFText
 */
lwf.Text = {

/**
 * @method GetText
 * @return {LWF::Text}
 */
GetText : function (
)
{
    return LWF::Text;
},

};

/**
 * @class LWFSprite
 */
lwf.Sprite = {

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
