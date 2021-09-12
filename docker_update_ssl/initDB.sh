#!/bin/sh
curl -X PUT http://admin:admin@127.0.0.1:5984/sapiens-db?partitioned=true 
curl -d @sapiens-db-init.json -H "Content-Type: application/json" -X POST http://admin:admin@localhost:5984/sapiens-db/_bulk_docs