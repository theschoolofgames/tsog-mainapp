// var Invitation = cc.Class.extend({
// 	_id: null,
// 	_inviterId: null,
// 	_inviteeId: null,

// 	ctor: function(id) {
// 		this._id = id;
// 	},

// 	populateFirebaseData: function(data) {
// 		this._inviteeId = data.inviteeId;
// 		this._inviterId = data.inviterId;
// 	},

// 	getId: function() {
// 		return this._id;
// 	},

// 	getInviterId: function() {
// 		return this._inviterId;
// 	},

// 	setInviterId: function(id) {
// 		this._inviterId = id;
// 		FirebaseManager.getInstance().setData("inviations/" + this._id + "/inviterId", this,_inviterId);
// 	},

// 	getInviteeId: function() {
// 		return this._inviteeId;
// 	}

// 	setInviteeId: function(id) {
// 		this._inviteeId = id;
// 		FirebaseManager.getInstance().setData("inviations/" + this._id + "/inviteeId", this,_inviterId);
// 	},
// });

// var _i = Invitation.prototype;

// cc.defineGetterSetter(_i, "inviterId", _i.getInviterId, _i.setInviterId);
// cc.defineGetterSetter(_i, "inviteeId", _i.getInviteeId, _i.setInviteeId);

// _i = null;

var Invitation = {};
Invitation.create = function(inviteeId, inviterId) {
	FirebaseManager.getInstance().setData("invitations/" + inviteeId, inviterId);
}