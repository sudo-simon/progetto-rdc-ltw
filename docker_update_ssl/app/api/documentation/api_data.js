define({ "api": [
  {
    "type": "get",
    "url": "/api/user/:username",
    "title": "Request User information by username (surname+student id)",
    "name": "GetUser",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "User",
            "description": "<p>unique username (surname+student id).</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Firstname of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "surname",
            "description": "<p>Lastname of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"name\": \"Dario\",\n  \"surname\": \"Basile\"\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UsernameFound",
            "description": "<p>The username User of the student was not found.</p>"
          },
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "DatabaseNotFound",
            "description": "<p>The database you are searching in was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"UsernameNotFound\"\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n{\n  \"error\": \"DatabaseNotFound\"\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "./apiServer.js",
    "groupTitle": "User",
    "sampleRequest": [
      {
        "url": "http://localhost:3001/api/user/:username"
      }
    ]
  }
] });
