import {
  FilterType,
  getMasterCRC,
} from 'crownstone-core';
import {AssetFilter as AssetFilterCore} from 'crownstone-core';
import {AssetFilter} from '../../models/cloud/asset-filter.model';
import {Asset, filterFormat, filterOutputDescription} from '../../models/cloud/asset.model';

export const FilterUtil = {

  setFilterMetaData: function(
    filter: AssetFilterCore,
    type : string,
    profileId : number,
    inputData: filterHubFormat,
    outputDescription: filterHubOutputDescription,
    exclude: boolean
  ) {

    filter.setFilterType(type === "CUCKOO" ? FilterType.CUCKCOO : FilterType.EXACT_MATCH)
    filter.useAsProfileId(profileId)

    if (exclude) {
      filter.markAsExcludeFilter()
    }

    switch (inputData.type) {
      case "MAC_ADDRESS":     filter.filterOnMacAddress();                                    break;
      case "MANUFACTURER_ID": filter.filterOnManufacturerId();                                break;
      case "FULL_AD_DATA":    filter.filterOnFullAdData(inputData.adType);                    break;
      case "MASKED_AD_DATA":  filter.filterOnMaskedAdData(inputData.adType, inputData.mask ); break;
    }

    switch (outputDescription.type) {
      case "NO_OUTPUT":
        filter.doNotOutput(); break;
      case "MAC_ADDRESS_REPORT":
        filter.outputMacRssiReport(); break;
      case "ASSET_ID_REPORT":
        switch (outputDescription.inputData.type) {
          case "MAC_ADDRESS":
            filter.outputTrackableShortIdBasedOnMacAddress();
            break;
          case "FULL_AD_DATA":
            filter.outputTrackableShortIdBasedOnFullAdType(outputDescription.inputData.adType);
            break;
          case "MASKED_AD_DATA":
            filter.outputTrackableShortIdBasedOnMaskedAdType(outputDescription.inputData.adType, outputDescription.inputData.mask);
            break;
          default:
            console.log("Invalid input data type received", outputDescription.inputData);
            throw "INVALID_INPUTDATA_TYPE";
        };
        break;
      default:
        console.log("Invalid outputDescription data type received", outputDescription);
        throw "INVALID_OUTPUT_DESCRIPTION_TYPE";
    }

    return filter.metaData;
  },


  getFilterSizeOverhead(asset: Asset, filterCommandProtocol: number) : number {
    // it does not matter here whether it is EXACT_MATCH or something else.
    let filter = new AssetFilterCore();
    return FilterUtil.setFilterMetaData(filter, "EXACT_MATCH", asset.profileId, asset.inputData, asset.outputDescription, asset.exclude).getPacket(filterCommandProtocol).length;
  },


  generateMasterCRC: function(filters: AssetFilter[]) : number {
    let payload : Record<filterId, filterCRC> = {};
    // map to required format.
    for (let filter of filters) {
      payload[filter.idOnCrownstone] = parseInt(filter.dataCRC, 16);
    }
    return getMasterCRC(payload)
  },


  getMetaDataDescriptionFromAsset: function(asset: Asset, filterType: string) {
    if (filterType === "EXACT_MATCH") {
      let dataBytes = Buffer.from(asset.data, 'hex');
      filterType = "EXACT_MATCH:" + dataBytes.length;
    }
    return FilterUtil.getMetaDataDescription(asset.profileId, asset.inputData, asset.outputDescription, asset.exclude, filterType);
  },


  getMetaDataDescriptionFromFilter: async function(filter: AssetFilter) : Promise<string> {
    let filterType = filter.type as string;
    if (filter.type === "EXACT_MATCH") {
      // we have to get the dataLength from the assets in the filter.
      let assets = filter.assets;
      if (assets && assets.length > 0) {
        let dataBytes = Buffer.from(assets[0].data, 'hex');
        filterType = "EXACT_MATCH:" + dataBytes.length;
      }
    }
    return FilterUtil.getMetaDataDescription(filter.profileId, filter.inputData, filter.outputDescription, filter.exclude, filterType);
  },


  /**
   * In the case of filter types which depend on an exact amount of bytes, the type is appended with ":<bytelength>", ie: ":2"
   * @param profileId
   * @param input
   * @param output
   * @param type
   */
  getMetaDataDescription: function(
    profileId: number,
    input : filterFormat,
    output: filterOutputDescription,
    exclude: boolean,
    type: string
  ) : string {

    let inputSet = '' + input.type;
    let outputSet = '' + output.type;
    switch (input.type) {
      case 'MAC_ADDRESS':
      case 'MANUFACTURER_ID':
        break;
      case 'FULL_AD_DATA':
        inputSet += input.adType;
        break;
      case 'MASKED_AD_DATA':
        inputSet += input.adType;
        inputSet += input.mask;
        break;
    }


    if (input.type === "FULL_AD_DATA") {
      inputSet += input.adType;
    }
    if (output.type === 'ASSET_ID_REPORT') {
      outputSet += output.inputData.type;
      switch (output.inputData.type) {
        case 'MAC_ADDRESS':
          break;
        case 'FULL_AD_DATA':
          outputSet += output.inputData.adType;
          break;
        case 'MASKED_AD_DATA':
          outputSet += output.inputData.adType;
          outputSet += output.inputData.mask;
          break;
      }
    }



    return `${type}_${inputSet}_${outputSet}_profileId:${profileId}_excludeType:${exclude}`;
  },

}