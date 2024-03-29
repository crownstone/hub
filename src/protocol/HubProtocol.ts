export const HubDataType : HubDataType = {
  SETUP:         0,
  COMMAND:       1,
  FACTORY_RESET: 2,
  FACTORY_RESET_HUB_ONLY: 3,
  REQUEST_DATA:  10,
}

export const HubReplyError : HubReplyError = {
  NOT_IN_SETUP_MODE: 0,
  IN_SETUP_MODE:     1,
  INVALID_TOKEN:     2,
  INVALID_MESSAGE:   100,
  UNKNOWN:           60000,
}

export const HubReplyCode : HubReplyCode = {
  SUCCESS:    0,
  DATA_REPLY: 10,
  ERROR:      4000
}

export const HubRequestDataType : HubRequestDataType = {
  CLOUD_ID: 0
}