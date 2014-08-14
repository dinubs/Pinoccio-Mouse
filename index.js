/*
 *
 *	Pinoccio, Johnny-Five and your Mac OSX Mouse
 * 	Created by: Gavin Dinubilo
 *
 */

// Create Pinoccio and Johnny-Five Variables
var Pinoccio = require("pinoccio-io");
var five = require('johnny-five');

// NodObjC Bridge to call Objective C Commands to control Mac Mouse Cursor
var $ = require('NodObjC');
// To Move the Mouse We need the Cocoa Objective C Framework
$.framework('Cocoa');
// Create 
var pool = $.NSAutoreleasePool('alloc')('init');

// Create The Pinoccio Board   
var board = new five.Board({
    io: new Pinoccio({
        token: '556b1bdbf12ce9d2cced117c093489ba',
        troop: '1',
        scout: '4'
    }).on('error', function(err) {
        console.log('error> ', err);
    })
});

// Create the point Variables
var ptX = 200;
var ptY = 200;

// Speed of the Mouse Cursor
var speed = 20;

// Initialize The Board 
board.on('ready', function() {
    console.log("ready");

    // Initialize the Push Buttons
    var leftClick = new five.Button({
        pin: "D3",
        invert: true
    });
    var rightClick = new five.Button({
        pin: "D2",
        invert: true
    });

    // Initialize the Joystick
    joystick = new five.Joystick({
        pins: ["A0", "A1"],
        freq: 50
    });
    // Inject the Joystick to the Board
    board.repl.inject({
        joystick: joystick
    });

    // Joystick Event API
    joystick.on("axismove", function(err, timestamp) {
        if (this.fixed.x < 0.85 && ptX < 1480) {
            ptX += speed * (1 - this.fixed.x);
        } else if (this.fixed.x > 0.97 && ptX > 0) {
            ptX -= speed * this.fixed.x;
        }
        if (this.fixed.y < 0.85 && ptY < 880) {
            ptY += speed * (1 - this.fixed.y);
        } else if (this.fixed.y > 0.97 && ptY > 0) {
            ptY -= speed * this.fixed.y;
        }

        // Log the X and Y coordinates of the Mouse, along with the Joystick Values
        console.log("LR:", this.fixed.x, "X: ", ptX);
        console.log("UD:", this.fixed.y, "Y: ", ptY);

        // Move the Mouse
        var moveEvent = $.CGEventCreateMouseEvent(null, $.kCGEventMouseMoved, $.CGPointMake(ptX, ptY), $.kCGMouseButtonLeft);
        $.CGEventPost($.kCGHIDEventTap, moveEvent);
    });

    // Detect if Left Push Button is Pressed
    leftClick.on("down", function() {
        var clickDown = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseDown, $.CGPointMake(ptX, ptY), $.kCGMouseButtonLeft);
        $.CGEventPost($.kCGHIDEventTap, clickDown);
        var clickUp = $.CGEventCreateMouseEvent(null, $.kCGEventLeftMouseUp, $.CGPointMake(ptX, ptY), $.kCGMouseButtonLeft);
        $.CGEventPost($.kCGHIDEventTap, clickUp);
    });

    //Detect if Right Push is Pressed
    rightClick.on("down", function() {
        var clickDown = $.CGEventCreateMouseEvent(null, $.kCGEventRightMouseDown, $.CGPointMake(ptX, ptY), $.kCGEventRightMouseDown);
        $.CGEventPost($.kCGHIDEventTap, clickDown);
        var clickUp = $.CGEventCreateMouseEvent(null, $.kCGEventRightMouseUp, $.CGPointMake(ptX, ptY), $.kCGEventRightMouseDown);
        $.CGEventPost($.kCGHIDEventTap, clickUp);
    });
});

pool('drain');