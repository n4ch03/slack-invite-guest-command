var request = require('request-promise');

module.exports =
    function (context, cb) {
      var mail;
      var userAndDomain;
      var channelName;
      var channelId;
      var token;
      var channelBase;

      token = context.data.SLACK_TOKEN;
      channelBase = context.data.SLACK_CHANNEL_NAME || exercise;

      userAndDomain = context.data.text.split('@');

      //really simple mail validation, others deegated to Slack API
      if (userAndDomain.length <= 1) {
        cb(null, "Please provide a valid email");
      } else if (token === 'undefined') {
        cb(null, "Sorry the token in you webhook isn't valid");
      } else {
        mail = context.data.text;

        if (/^\+.*/.test(mail)) {
          //we want to create a channel
          mail = context.data.text.slice(1);
          channelName = userAndDomain[0].slice(1) + "-" + channelBase;
          createChannel(channelName)
            .then(function(json) {
              channelId = json.channel.id;
              inviteUser(mail, channelId);
            }).then(function(json) {
              inviteUserToChannel(context.data.user_id, channelId);
            }).then(function(json) {
              console.log(json);
              cb(null, "Channel And User Created");
            })
            .catch(function(err) {
              cb(err, null);
            });
        } else {
          //just join current channel
          if (context.data.channel_name === 'directmessage' ||
              context.data.channel_name === 'privategroup') {
            cb(null, "You need to be in a channel to invite an external user");
          } else {
              channelId = context.data.channel_id;
              inviteUser(mail, channelId)
                .then(function(json) {
                  cb(null, "User created and invited to channel");
                })
                .catch(function(err) {
                  cb(err, null);
                });
          }
        }
      }

    }

function feedbackMessage(message, channelId) {
  return request({
    json: true,
    method: 'POST',
    url: 'https://n4ch03.slack.com/api/chat.postMessage',
    qs: {
      "token": "xoxp-15400240608-15395415013-15409120775-7e95fad705",
      "channel": channelId,
      "username": 'Josesito',
      "text": message
     },
    });
}

function createChannel(channelName) {
  return request({
    json: true,
    method: 'POST',
    url: 'https://n4ch03.slack.com/api/channels.join',
    qs: {
      "name": channelName,
      "in_background": false,
      "token": "xoxp-15400240608-15395415013-15409120775-7e95fad705",
      "_attempts": 1
    }
  });

}

function inviteUser(email, channel) {
  return request({
    json: true,
    method: 'POST',
    url: 'https://n4ch03.slack.com/api/users.admin.invite',
    qs: {
      "email": email,
      "ultra_restricted": 1,
      "token": "xoxp-15400240608-15395415013-15409120775-7e95fad705",
      "set_active": true,
      "_attempts": 1,
      "channels": channel
    }
  });
}

function inviteUserToChannel(userId, channelId) {
  return request({
    json: true,
    method: 'POST',
    url: 'https://n4ch03.slack.com/api/channels.invite',
    qs: {
      "token": "xoxp-15400240608-15395415013-15409120775-7e95fad705",
      "channel": channelId,
      "user": userId
    }
  });
}
