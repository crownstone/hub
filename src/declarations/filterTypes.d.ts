type filterFormat_macAddressType_t   = "MAC_ADDRESS"
type filterFormat_fullAdDataType_t   = "FULL_AD_DATA"
type filterFormat_maskedAdDataType_t = "MASKED_AD_DATA"
type filterFormat_manufacturerId_t   = "MANUFACTURER_ID"

type filterFormat_macAddress_report_t  = "MAC_ADDRESS_REPORT"
type filterFormat_assetId_report_t     = "ASSET_ID_REPORT"
type filterFormat_noOutput_t           = "NO_OUTPUT"

type filterType_t = "CUCKOO" | "EXACT_MATCH"

interface FormatMacAddress {
  type: filterFormat_macAddressType_t
}

interface FormatFullAdData {
  type:   filterFormat_fullAdDataType_t,
  adType: number,
}


interface FormatMaskedAdData {
  type:   filterFormat_maskedAdDataType_t,
  adType: number,
  mask:   number
}

interface FilterInputManufacturerId {
  type:   filterFormat_manufacturerId_t,
}

type filterHubFormat = FormatMacAddress | FormatFullAdData | FormatMaskedAdData | FilterInputManufacturerId;

interface FilterOutputDescription_macAddress {
  type: filterFormat_macAddress_report_t
}

interface FilterOutputDescription_noOutput {
  type: filterFormat_noOutput_t
}

interface FilterOutputDescription_assetId{
  type:      filterFormat_assetId_report_t,
  inputData: filterHubFormat
}

type filterHubOutputDescription = FilterOutputDescription_macAddress | FilterOutputDescription_noOutput | FilterOutputDescription_assetId