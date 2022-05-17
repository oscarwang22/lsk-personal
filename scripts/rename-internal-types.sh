#!/bin/sh
set -eu

sr -s '\bServerMessageType\b' -r 'ServerMsgCode'
sr -s '(  +|\bServerMsgCode[.])UpdatePresence\b' -r '${1}UPDATE_PRESENCE'
sr -s '(  +|\bServerMsgCode[.])UserJoined\b' -r '${1}USER_JOINED'
sr -s '(  +|\bServerMsgCode[.])UserLeft\b' -r '${1}USER_LEFT'
sr -s '(  +|\bServerMsgCode[.])Event\b' -r '${1}EVENT'
sr -s '(  +|\bServerMsgCode[.])RoomState\b' -r '${1}ROOM_STATE'
sr -s '(  +|\bServerMsgCode[.])InitialStorageState\b' -r '${1}INITIAL_STORAGE_STATE'
sr -s '(  +|\bServerMsgCode[.])UpdateStorage\b' -r '${1}UPDATE_STORAGE'

sr -s '\bClientMessageType\b' -r 'ClientMsgCode'
sr -s '(  +|\bClientMsgCode[.])UpdatePresence\b' -r '${1}UPDATE_PRESENCE'
sr -s '(  +|\bClientMsgCode[.])ClientEvent\b' -r '${1}CLIENT_EVENT'
sr -s '(  +|\bClientMsgCode[.])FetchStorage\b' -r '${1}FETCH_STORAGE'
sr -s '(  +|\bClientMsgCode[.])UpdateStorage\b' -r '${1}UPDATE_STORAGE'

sr -s '\bOpType\b' -r 'OpCode'
sr -s '(  +|\bOpCode[.])Init\b' -r '${1}INIT'
sr -s '(  +|\bOpCode[.])SetParentKey\b' -r '${1}SET_PARENT_KEY'
sr -s '(  +|\bOpCode[.])CreateList\b' -r '${1}CREATE_LIST'
sr -s '(  +|\bOpCode[.])UpdateObject\b' -r '${1}UPDATE_OBJECT'
sr -s '(  +|\bOpCode[.])CreateObject\b' -r '${1}CREATE_OBJECT'
sr -s '(  +|\bOpCode[.])DeleteCrdt\b' -r '${1}DELETE_CRDT'
sr -s '(  +|\bOpCode[.])DeleteObjectKey\b' -r '${1}DELETE_OBJECT_KEY'
sr -s '(  +|\bOpCode[.])CreateMap\b' -r '${1}CREATE_MAP'
sr -s '(  +|\bOpCode[.])CreateRegister\b' -r '${1}CREATE_REGISTER'

# sr -s '\bCrdtType\b' -r 'CrdtType'
sr -s '(  +|\bCrdtType[.])Object\b' -r '${1}OBJECT'
sr -s '(  +|\bCrdtType[.])List\b' -r '${1}LIST'
sr -s '(  +|\bCrdtType[.])Map\b' -r '${1}MAP'
sr -s '(  +|\bCrdtType[.])Register\b' -r '${1}REGISTER'

sr -s '\bServerMessage\b' -r 'ServerMsg'
sr -s '\bUpdatePresenceMessage\b' -r 'UpdatePresenceServerMsg'
sr -s '\bUserJoinMessage\b' -r 'UserJoinServerMsg'
sr -s '\bUserLeftMessage\b' -r 'UserLeftServerMsg'
sr -s '\bEventMessage\b' -r 'EventServerMsg'
sr -s '\bRoomStateMessage\b' -r 'RoomStateServerMsg'
sr -s '\bInitialDocumentStateMessage\b' -r 'InitialDocumentStateServerMsg'
sr -s '\bUpdateStorageMessage\b' -r 'UpdateStorageServerMsg'

sr -s '\bClientMessage\b' -r 'ClientMsg'
sr -s '\bClientEventMessage\b' -r 'EventClientMsg'
sr -s '\bUpdatePresenceClientMessage\b' -r 'UpdatePresenceClientMsg'
sr -s '\bUpdateStorageClientMessage\b' -r 'UpdateStorageClientMsg'
sr -s '\bFetchStorageClientMessage\b' -r 'FetchStorageClientMsg'
