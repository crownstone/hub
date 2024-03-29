

export const topics : {[topicEnum: string]: string} = {
  CLOUD_SYNC_REQUIRED  : "CLOUD_SYNC_REQUIRED",
  TOKEN_EXPIRED        : "TOKEN_EXPIRED",

  CLOUD_AUTHENTICATION_PROBLEM_401 : "CLOUD_AUTHENTICATION_PROBLEM_401",

  HUB_CREATED          : "HUB_CREATED",
  HUB_DELETED          : "HUB_DELETED",
  HUB_UART_KEY_UPDATED : "HUB_UART_KEY_UPDATED",

  MESH_SERVICE_DATA    : "MESH_SERVICE_DATA",
  MESH_TOPOLOGY        : "MESH_TOPOLOGY",

  HUB_CONFIG_UPDATED   : "HUB_CONFIG_UPDATED"
}

export const WebhookTopics : {[topicEnum: string]: string} = {
  ASSET_REPORT:   "ASSET_REPORT",
}
export const WebhookInternalTopics : {[topicEnum: string]: string} = {
  __ASSET_REPORT:           "__ASSET_REPORT",
}