
import api from './api';

// Update Server PM Report Form
export const updateServerPMReportForm = async (id, formData, user) => {
  try {
    console.log("Update Server PM Report form - RECEIVED Data");
    console.log(formData);

    // Helper function to transform component data (same as in submitServerPMReportForm)
    const transformComponentData = (componentData, componentName) => {
      if (!componentData) return null;
      
      // Helper function to transform field names in details
      const transformDetailFields = (details) => {
        if (!Array.isArray(details)) return details;
        
        return details.map(detail => {
          const transformedDetail = { ...detail };
          
          // Transform "result" field to "ResultStatusID" for API compatibility
          if (transformedDetail.result !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.result;
            delete transformedDetail.result;
          }
          
          // Transform "done" field to "ResultStatusID" for API compatibility (used by HotFixes)
          if (transformedDetail.done !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.done;
            delete transformedDetail.done;
          }
          
          // Transform ASA Firewall specific fields for API compatibility
          if (transformedDetail.expectedResultId !== undefined) {
            transformedDetail.ASAFirewallStatusID = transformedDetail.expectedResultId;
            delete transformedDetail.expectedResultId;
          }
          
          if (transformedDetail.doneId !== undefined) {
            transformedDetail.ResultStatusID = transformedDetail.doneId;
            delete transformedDetail.doneId;
          }
          
          return transformedDetail;
        });
      };
      
      // Special handling for ASA Firewall data
      const isASAFirewallDefaultData = (data) => {
        if (!data || !data.details || !Array.isArray(data.details) || data.details.length === 0) return false;
        
        // Check if all items are default ASA Firewall commands with no user completion
        return data.details.every(item => {
          const isDefaultCommand = (item.commandInput === 'show cpu usage' || item.commandInput === 'show environment');
          const hasNoUserCompletion = (!item.doneId || item.doneId === '');
          return isDefaultCommand && hasNoUserCompletion;
        });
      };

      // Special handling for Auto Failover data
      const isAutoFailOverDefaultData = (dataArray) => {
        if (!Array.isArray(dataArray) || dataArray.length === 0) return false;
        
        // Check if all items are default Auto Failover scenarios with no user input
        return dataArray.every(item => {
          const hasDefaultServers = (item.toServer === 'SCA-SR2' || item.toServer === 'SCA-SR1') && 
                                   (item.fromServer === 'SCA-SR1' || item.fromServer === 'SCA-SR2');
          const hasDefaultFailoverType = item.failoverType && item.failoverType.trim() !== '';
          const hasDefaultExpectedResult = item.expectedResult && item.expectedResult.trim() !== '';
          const hasNoUserInput = (!item.result || item.result === '');
          
          return hasDefaultServers && hasDefaultFailoverType && hasDefaultExpectedResult && hasNoUserInput;
        });
      };
      
      // Handle direct array structure
      if (Array.isArray(componentData)) {
        // Only return data if array has meaningful content
        if (componentData.length === 0 || componentData.every(item => !item || Object.keys(item).length === 0)) {
          return null;
        }
        
        // Special check for ASA Firewall default data
        if (componentName === 'asaFirewallData' && isASAFirewallDefaultData({ details: componentData })) {
          return null;
        }
        
        // Special check for Auto Failover default data
        if (componentName === 'autoFailOverData' && isAutoFailOverDefaultData(componentData)) {
          return null;
        }
        
        return {
          remarks: '',
          details: transformDetailFields(componentData)
        };
      }
      
      // Handle nested structure with remarks
      if (componentData.remarks !== undefined) {
        const dataArray = componentData[componentName] || componentData.asaFirewallData || componentData.autoFailOverData || componentData.data || [];
        
        // Check if there's meaningful data
        const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
        let hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                        dataArray.some(item => item && Object.keys(item).length > 0);
        
        // Special handling for diskUsageData - check for servers with actual disk data
        if (componentName === 'diskUsageData') {
          const servers = componentData.servers || [];
          hasDetails = Array.isArray(servers) && servers.length > 0 && 
                      servers.some(server => 
                        server && 
                        server.serverName && 
                        server.serverName.trim() !== '' &&
                        Array.isArray(server.disks) && 
                        server.disks.length > 0 &&
                        server.disks.some(disk => 
                          disk && (
                            (disk.disk && disk.disk.trim() !== '') ||
                            (disk.status && disk.status.trim() !== '') ||
                            (disk.capacity && disk.capacity.trim() !== '') ||
                            (disk.freeSpace && disk.freeSpace.trim() !== '') ||
                            (disk.usage && disk.usage.trim() !== '') ||
                            (disk.check && disk.check.trim() !== '')
                          )
                        )
                      );
        }
        
        // Helper function to convert YesNo status name to ID
        const convertYesNoStatusToId = (statusValue, yesNoStatusOptions) => {
          if (!statusValue || statusValue.trim() === '') return null;
          
          // If it's already a GUID, return as is
          const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          if (guidRegex.test(statusValue)) {
            return statusValue;
          }
          
          // Find the option by name (case insensitive)
          const option = yesNoStatusOptions?.find(opt => 
            opt.name?.toLowerCase() === statusValue.toLowerCase() ||
            opt.Name?.toLowerCase() === statusValue.toLowerCase()
          );
          
          return option ? (option.id || option.ID) : statusValue;
        };

        // Special handling for monthlyDatabaseCreationData
        if (componentName === 'monthlyDatabaseCreationData') {
          const monthlyDatabaseData = componentData.monthlyDatabaseData || [];
          const yesNoStatusOptions = componentData.yesNoStatusOptions || [];
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(monthlyDatabaseData) && monthlyDatabaseData.length > 0 && 
                            monthlyDatabaseData.some(item => 
                              item && (
                                (item.item && item.item.trim() !== '') ||
                                (item.monthlyDBCreated && item.monthlyDBCreated.trim() !== '')
                              )
                            );
          
          if (!hasRemarks && !hasDetails) {
            return null;
          }
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: monthlyDatabaseData.map((item, index) => ({
              ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
              SerialNo: (index + 1).toString(),
              ServerName: item.item || '',
              YesNoStatusID: convertYesNoStatusToId(item.monthlyDBCreated, yesNoStatusOptions),
              Remarks: '',
              IsNew: item.IsNew || item.isNew || false,
              IsDeleted: item.IsDeleted || item.isDeleted || false
            }))
          };
          
          return transformedData;
        }

        // Special handling for databaseBackupData
        if (componentName === 'databaseBackupData') {
          const mssqlBackupData = componentData.mssqlBackupData || [];
          const scadaBackupData = componentData.scadaBackupData || [];
          const yesNoStatusOptions = componentData.yesNoStatusOptions || [];
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasLatestBackupFileName = componentData.latestBackupFileName && componentData.latestBackupFileName.trim() !== '';
          
          const hasMssqlData = Array.isArray(mssqlBackupData) && mssqlBackupData.length > 0 && 
                              mssqlBackupData.some(item => 
                                item && (
                                  (item.item && item.item.trim() !== '') ||
                                  (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated.trim() !== '')
                                )
                              );
          
          const hasScadaData = Array.isArray(scadaBackupData) && scadaBackupData.length > 0 && 
                              scadaBackupData.some(item => 
                                item && (
                                  (item.item && item.item.trim() !== '') ||
                                  (item.monthlyDBBackupCreated && item.monthlyDBBackupCreated.trim() !== '')
                                )
                              );
          
          if (!hasRemarks && !hasLatestBackupFileName && !hasMssqlData && !hasScadaData) {
            //console.log('transformComponentData - databaseBackupData has no data, returning null');
            return null;
          }
          
          // Transform MSSQL backup data
          const mssqlDetails = mssqlBackupData.map((item, index) => ({
            ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
            SerialNo: (index + 1).toString(),
            ServerName: item.item || '',
            YesNoStatusID: convertYesNoStatusToId(item.monthlyDBBackupCreated, yesNoStatusOptions),
            Remarks: '',
            IsNew: item.IsNew || item.isNew || false,
            IsDeleted: item.IsDeleted || item.isDeleted || false
          }));
          
          // Transform SCADA backup data
          const scadaDetails = scadaBackupData.map((item, index) => ({
            ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
            SerialNo: (index + 1).toString(),
            ServerName: item.item || '',
            YesNoStatusID: convertYesNoStatusToId(item.monthlyDBBackupCreated, yesNoStatusOptions),
            Remarks: '',
            IsNew: item.IsNew || item.isNew || false,
            IsDeleted: item.IsDeleted || item.isDeleted || false
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            latestBackupFileName: componentData.latestBackupFileName || '',
            mssqlDetails: mssqlDetails,
            scadaDetails: scadaDetails
          };
          
          //console.log('transformComponentData - databaseBackupData output:', transformedData);
          return transformedData;
        }

        // Special handling for networkHealthData - simple structure without details
        if (componentName === 'networkHealthData') {
          
          const hasData = (componentData.dateChecked && componentData.dateChecked !== null) ||
                         (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - networkHealthData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            DateChecked: componentData.dateChecked || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - networkHealthData output:', transformedData);
          return transformedData;
        }
        // Special handling for Willowlynx Process Status - simple structure without details
        if (componentName === 'willowlynxProcessStatusData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxProcessStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxProcessStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Network Status - simple structure without details
        if (componentName === 'willowlynxNetworkStatusData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxNetworkStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxNetworkStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx RTU Status - simple structure without details
        if (componentName === 'willowlynxRTUStatusData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxRTUStatusData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxRTUStatusData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Historical Trend - simple structure without details
        if (componentName === 'willowlynxHistoricalTrendData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxHistoricalTrendData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxHistoricalTrendData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Historical Report - simple structure without details
        if (componentName === 'willowlynxHistoricalReportData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxHistoricalReportData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxHistoricalReportData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx CCTV Camera - simple structure without details
        if (componentName === 'willowlynxCCTVCameraData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxCCTVCameraData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxCCTVCameraData output:', transformedData);
          return transformedData;
        }

        // Special handling for Willowlynx Sump Pit CCTV Camera - simple structure without details
        if (componentName === 'willowlynxSumpPitCCTVCameraData') {
          
          const hasData = (componentData.result && componentData.result.trim() !== '') ||
                         (componentData.remarks && componentData.remarks.trim() !== '');
          
          if (!hasData) {
            //console.log('transformComponentData - willowlynxSumpPitCCTVCameraData has no data, returning null');
            return null;
          }
          
          const transformedData = {
            YesNoStatusID: componentData.result || null,
            Remarks: componentData.remarks || ''
          };
          
          //console.log('transformComponentData - willowlynxSumpPitCCTVCameraData output:', transformedData);
          return transformedData;
        }

        // Special handling for hotFixesData - map frontend field names to backend DTO field names
        if (componentName === 'hotFixesData') {
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && Object.keys(item).length > 0);
          
          if (!hasRemarks && !hasDetails) {
            //console.log('transformComponentData - hotFixesData has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
            SerialNo: String(item.serialNo || (index + 1)), // Ensure string conversion
            ServerName: item.machineName || '',
            LatestHotFixsApplied: item.hotFixName || '',
            ResultStatusID: item.done || null, // 'done' field contains the ResultStatus GUID
            Remarks: item.remarks || '',
            IsNew: item.IsNew || item.isNew || false,
            IsDeleted: item.IsDeleted || item.isDeleted || false
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: transformedDetails
          };
          
          //console.log('transformComponentData - hotFixesData output:', transformedData);
          return transformedData;
        }

        // Special handling for timeSyncData
        if (componentName === 'timeSyncData') {
          
          const timeSyncDataArray = componentData.timeSyncData || [];
          
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(timeSyncDataArray) && timeSyncDataArray.length > 0 && 
                            timeSyncDataArray.some(item => 
                              item && (
                                (item.machineName && item.machineName.trim() !== '') ||
                                (item.timeSyncResult && item.timeSyncResult.trim() !== '')
                              )
                            );
          
          console.log('hasRemarks:', hasRemarks, 'hasDetails:', hasDetails);
          
          if (!hasRemarks && !hasDetails) {
            return null;
          }
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: timeSyncDataArray.map((item, index) => {
              console.log(`Processing item ${index}:`, JSON.stringify(item, null, 2));
              const transformedItem = {
                ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
                SerialNo: (index + 1).toString(),
                ServerName: item.machineName || '',
                ResultStatusID: item.timeSyncResult || null,
                Remarks: '',
                IsNew: item.IsNew || item.isNew || false,
                IsDeleted: item.IsDeleted || item.isDeleted || false
              };
              console.log(`Transformed item ${index}:`, JSON.stringify(transformedItem, null, 2));
              return transformedItem;
            })
          };
          
          //console.log('transformComponentData - timeSyncData output:', JSON.stringify(transformedData, null, 2));
          return transformedData;
        }

        // Special handling for cpuAndRamUsageData - check for memory and CPU data
        if (componentName === 'cpuAndRamUsageData') {
          const memoryData = componentData.memoryUsageData || [];
          const cpuData = componentData.cpuUsageData || [];
          
          const hasMemoryData = Array.isArray(memoryData) && memoryData.length > 0 && 
                               memoryData.some(memory => 
                                 memory && (
                                   (memory.machineName && memory.machineName.trim() !== '') ||
                                   (memory.memorySize && memory.memorySize.trim() !== '') ||
                                   (memory.memoryInUse && memory.memoryInUse.trim() !== '') ||
                                   (memory.memoryInUsed && memory.memoryInUsed.trim() !== '') ||
                                   (memory.memoryUsageCheck && memory.memoryUsageCheck.trim() !== '')
                                 )
                               );
          
          const hasCpuData = Array.isArray(cpuData) && cpuData.length > 0 && 
                            cpuData.some(cpu => 
                              cpu && (
                                (cpu.machineName && cpu.machineName.trim() !== '') ||
                                (cpu.cpuUsage && cpu.cpuUsage.trim() !== '') ||
                                (cpu.cpuUsageCheck && cpu.cpuUsageCheck.trim() !== '')
                              )
                            );
          
          hasDetails = hasMemoryData || hasCpuData;
        }
        
        // Special check for ASA Firewall default data
        if (componentName === 'asaFirewallData' && isASAFirewallDefaultData({ details: dataArray })) {
          hasDetails = false;
        }
        
        // Special check for Auto Failover default data
        if (componentName === 'autoFailOverData' && isAutoFailOverDefaultData(dataArray)) {
          hasDetails = false;
        }
        
        // Only return data if there's meaningful content
        if (!hasRemarks && !hasDetails) {
          return null;
        }
        
        // Transform the data based on component type
        let detailsToTransform = dataArray;
        
        // Special handling for diskUsageData - send hierarchical structure directly
        if (componentName === 'diskUsageData' && componentData.servers) {
          console.log('DiskUsage Transform - Input servers:', componentData.servers);
          
          // Transform servers to match backend DTO structure
          const transformedServers = componentData.servers.map(server => ({
            Id: server.id || null,
            ServerName: server.serverName,
            Disks: server.disks.map(disk => {
              // Map status name to ID if needed
              let statusId = disk.status;
              if (typeof disk.status === 'string' && componentData.serverDiskStatusOptions) {
                const statusOption = componentData.serverDiskStatusOptions.find(option => option.name === disk.status);
                if (statusOption) {
                  statusId = statusOption.id;
                }
              }
              
              return {
                Id: disk.id || null,
                Disk: disk.disk,
                Status: statusId,
                Capacity: disk.capacity,
                FreeSpace: disk.freeSpace,
                Usage: disk.usage,
                Check: disk.check,
                Remarks: disk.remarks || '',
                IsNew: disk.isNew || false,
                IsModified: disk.isModified || false,
                IsDeleted: disk.isDeleted || false
              };
            }),
            IsNew: server.isNew || false,
            IsModified: server.isModified || false,
            IsDeleted: server.isDeleted || false
          }));
          
          console.log('DiskUsage Transform - Transformed servers:', transformedServers);
          
          return {
            remarks: componentData.remarks || '',
            servers: transformedServers,
            details: [] // Keep empty for backward compatibility
          };
        }
        
        // Special handling for cpuAndRamUsageData - transform memory and CPU data to separate arrays
        if (componentName === 'cpuAndRamUsageData') {
          const cpuUsageDetails = [];
          const memoryUsageDetails = [];
          
          // Add memory usage data
          if (componentData.memoryUsageData && Array.isArray(componentData.memoryUsageData)) {
            componentData.memoryUsageData.forEach((memory, index) => {
              // Include all items, even if marked as deleted (backend needs to handle deletion)
              if (memory) {
                const resultStatusID = memory.memoryUsageCheck && memory.memoryUsageCheck.trim() !== '' ? memory.memoryUsageCheck : null;
                
                memoryUsageDetails.push({
                  ID: (memory.IsNew || memory.isNew) ? null : (memory.ID || memory.id || null),
                  serialNo: (index + 1).toString(),
                  serverName: memory.machineName || '',
                  memorySize: memory.memorySize || '',
                  memoryInUse: memory.memoryInUse || '',
                  resultStatusID: resultStatusID,
                  remarks: memory.remarks || '',
                  IsNew: memory.IsNew || memory.isNew || false,
                  IsDeleted: memory.IsDeleted || memory.isDeleted || false
                  // Note: IsModified is not supported in UpdatePMServerMemoryUsageDetailDto
                });
              }
            });
          }
          
          // Add CPU usage data
          if (componentData.cpuUsageData && Array.isArray(componentData.cpuUsageData)) {
            componentData.cpuUsageData.forEach((cpu, index) => {
              // Include all items, even if marked as deleted (backend needs to handle deletion)
              if (cpu) {
                const resultStatusID = cpu.cpuUsageCheck && cpu.cpuUsageCheck.trim() !== '' ? cpu.cpuUsageCheck : null;
                
                cpuUsageDetails.push({
                  ID: (cpu.IsNew || cpu.isNew) ? null : (cpu.ID || cpu.id || null),
                  serialNo: (index + 1).toString(),
                  serverName: cpu.machineName || '',
                  cpuUsage: cpu.cpuUsage || '',
                  resultStatusID: resultStatusID,
                  remarks: cpu.remarks || '',
                  IsNew: cpu.IsNew || cpu.isNew || false,
                  IsDeleted: cpu.IsDeleted || cpu.isDeleted || false
                  // Note: IsModified is not supported in UpdatePMServerCPUUsageDetailDto
                });
              }
            });
          }
          
          return {
            remarks: componentData.remarks || '',
            cpuUsageDetails: cpuUsageDetails,
            memoryUsageDetails: memoryUsageDetails
          };
        }
        
        // Special handling for autoFailOverData - map frontend field names to backend DTO field names
        if (componentName === 'autoFailOverData') {
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && Object.keys(item).length > 0);
          
          if (!hasRemarks && !hasDetails) {
            //console.log('transformComponentData - autoFailOverData has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
            YesNoStatusID: item.result || null, // 'result' field contains the YesNoStatus GUID
            ToServer: item.toServer || '',
            FromServer: item.fromServer || '',
            Remarks: item.remarks || '',
            IsNew: item.IsNew || item.isNew || false,
            IsDeleted: item.IsDeleted || item.isDeleted || false
          }));
          
          const transformedData = {
            remarks: componentData.remarks || '',
            details: transformedDetails
          };
          
          //console.log('transformComponentData - autoFailOverData output:', transformedData);
          return transformedData;
        }

        // Special handling for softwarePatchData - map frontend field names to backend DTO field names
        if (componentName === 'softwarePatchData') {
          // Handle new structure where remarks and softwarePatchData are passed separately
          if (componentData.remarks !== undefined && componentData.softwarePatchData !== undefined) {
            const remarks = componentData.remarks || '';
            const dataArray = componentData.softwarePatchData;
            
            const hasRemarks = remarks && remarks.trim() !== '';
            const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                              dataArray.some(item => item && (
                                (item.serialNo && String(item.serialNo).trim() !== '') ||
                                (item.machineName && item.machineName.trim() !== '') ||
                                (item.previousPatch && item.previousPatch.trim() !== '') ||
                                (item.currentPatch && item.currentPatch.trim() !== '')
                              ));
            
            if (!hasRemarks && !hasDetails) {
              //console.log('transformComponentData - softwarePatchData (new structure) has no data, returning null');
              return null;
            }
            
            // Transform field names to match backend DTO
            const transformedDetails = dataArray.map((item, index) => ({
              ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
              SerialNo: String(item.serialNo || (index + 1)),
              ServerName: item.machineName || '',
              PreviousPatch: item.previousPatch || '',
              CurrentPatch: item.currentPatch || '',
              Remarks: item.remarks || '',
              IsNew: item.IsNew || item.isNew || false,
              IsDeleted: item.IsDeleted || item.isDeleted || false,
              IsModified: item.IsModified || item.isModified || false
            }));
            
            const transformedData = {
              Remarks: remarks,
              Details: transformedDetails
            };
            
            //console.log('transformComponentData - softwarePatchData (new structure) output:', transformedData);
            return transformedData;
          }
          
          // Handle flattened array structure (direct array)
          if (Array.isArray(componentData)) {
            const hasDetails = componentData.length > 0 && 
                              componentData.some(item => item && (
                                (item.serialNo && String(item.serialNo).trim() !== '') ||
                                (item.machineName && item.machineName.trim() !== '') ||
                                (item.previousPatch && item.previousPatch.trim() !== '') ||
                                (item.currentPatch && item.currentPatch.trim() !== '')
                              ));
            
            if (!hasDetails) {
              //console.log('transformComponentData - softwarePatchData (flattened array) has no data, returning null');
              return null;
            }
            
            // Transform field names to match backend DTO
            const transformedDetails = componentData.map((item, index) => ({
              ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
              SerialNo: String(item.serialNo || (index + 1)),
              ServerName: item.machineName || '',
              PreviousPatch: item.previousPatch || '',
              CurrentPatch: item.currentPatch || '',
              Remarks: item.remarks || '',
              IsNew: item.IsNew || item.isNew || false,
              IsDeleted: item.IsDeleted || item.isDeleted || false,
              IsModified: item.IsModified || item.isModified || false
            }));
            
            const transformedData = {
              Remarks: '', // No remarks in flattened array structure
              Details: transformedDetails
            };
            
            //console.log('transformComponentData - softwarePatchData (flattened array) output:', transformedData);
            return transformedData;
          }
          
          // Handle old nested structure (backward compatibility)
          const hasRemarks = componentData.remarks && componentData.remarks.trim() !== '';
          const hasDetails = Array.isArray(dataArray) && dataArray.length > 0 && 
                            dataArray.some(item => item && (
                              (item.serialNo && String(item.serialNo).trim() !== '') ||
                              (item.machineName && item.machineName.trim() !== '') ||
                              (item.previousPatch && item.previousPatch.trim() !== '') ||
                              (item.currentPatch && item.currentPatch.trim() !== '')
                            ));
          
          if (!hasRemarks && !hasDetails) {
            //console.log('transformComponentData - softwarePatchData (old structure) has no data, returning null');
            return null;
          }
          
          // Transform field names to match backend DTO
          const transformedDetails = dataArray.map((item, index) => ({
            ID: (item.IsNew || item.isNew) ? null : (item.ID || item.id || null),
            SerialNo: String(item.serialNo || (index + 1)),
            ServerName: item.machineName || '',
            PreviousPatch: item.previousPatch || '',
            CurrentPatch: item.currentPatch || '',
            Remarks: item.remarks || '',
            IsNew: item.IsNew || item.isNew || false,
            IsDeleted: item.IsDeleted || item.isDeleted || false,
            IsModified: item.IsModified || item.isModified || false
          }));
          
          const transformedData = {
            Remarks: componentData.remarks || '',
            Details: transformedDetails
          };
          
          //console.log('transformComponentData - softwarePatchData (old structure) output:', transformedData);
          return transformedData;
        }

        // Fallback for other components - but NOT for Willowlynx components
        if (componentName.startsWith('willowlynx')) {
          // This should not happen if all Willowlynx components are handled above
          console.warn(`Unhandled Willowlynx component: ${componentName}`, componentData);
          return null;
        }

        return {
          remarks: componentData.remarks || '',
          details: transformDetailFields(Array.isArray(detailsToTransform) ? detailsToTransform : [])
        };
      }
      
      return null;
    };

    // Transform the form data using the same structure as submit
    const updateData = {
      PMReportFormTypeID: formData.pmReportFormTypeID,
      ProjectNo: formData.projectNo || '',
      Customer: formData.customer || '',
      ReportTitle: formData.reportTitle || 'Server Preventive Maintenance Report',
      FormstatusID: formData.formstatusID || formData.formStatusID || null,
      SignOffData: {
        AttendedBy: formData.signOffData.attendedBy || '',
        WitnessedBy: formData.signOffData.witnessedBy || '',
        StartDate: formData.signOffData.startDate ? new Date(formData.signOffData.startDate).toISOString() : null,
        CompletionDate: formData.signOffData.completionDate ? new Date(formData.signOffData.completionDate).toISOString() : null,
        Remarks: formData.signOffData.remarks || ''
      },
      UpdatedBy: user?.id || null,

      // Transform component data using the same transformComponentData function
      serverHealthData: transformComponentData(formData.serverHealthData, 'serverHealthData'),
      hardDriveHealthData: transformComponentData(formData.hardDriveHealthData, 'hardDriveHealthData'),
      diskUsageData: transformComponentData(formData.diskUsageData, 'diskUsageData'),
      cpuAndRamUsageData: transformComponentData(formData.cpuAndRamUsageData, 'cpuAndRamUsageData'),
      networkHealthData: transformComponentData(formData.networkHealthData, 'networkHealthData'),
      willowlynxProcessStatusData: transformComponentData(formData.willowlynxProcessStatusData, 'willowlynxProcessStatusData'),
      willowlynxNetworkStatusData: transformComponentData(formData.willowlynxNetworkStatusData, 'willowlynxNetworkStatusData'),
      willowlynxRTUStatusData: transformComponentData(formData.willowlynxRTUStatusData, 'willowlynxRTUStatusData'),
      willowlynxHistoricalTrendData: transformComponentData(formData.willowlynxHistorialTrendData, 'willowlynxHistoricalTrendData'),
      willowlynxHistoricalReportData: transformComponentData(formData.willowlynxHistoricalReportData, 'willowlynxHistoricalReportData'),
      willowlynxSumpPitCCTVCameraData: transformComponentData(formData.willowlynxSumpPitCCTVCameraData, 'willowlynxSumpPitCCTVCameraData'),
      monthlyDatabaseCreationData: transformComponentData(formData.monthlyDatabaseCreationData, 'monthlyDatabaseCreationData'),
      databaseBackupData: transformComponentData(formData.databaseBackupData, 'databaseBackupData'),
      timeSyncData: transformComponentData(formData.timeSyncData, 'timeSyncData'),
      hotFixesData: transformComponentData(formData.hotFixesData, 'hotFixesData'),
      autoFailOverData: transformComponentData(formData.autoFailOverData, 'autoFailOverData'),
      asaFirewallData: transformComponentData(formData.asaFirewallData, 'asaFirewallData'),
      softwarePatchData: transformComponentData(formData.softwarePatchData, 'softwarePatchData')
    };

    console.log('=== SENDING UPDATE DATA ===');
    //console.log('DiskUsageData being sent to API:', JSON.stringify(updateData.diskUsageData, null, 2));
    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    // Make API call to update the PM report
    const response = await api.put(`/pmreportformserver/${id}`, updateData);

    return { 
      success: true, 
      message: 'Server PM report updated successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Error in updateServerPMReportForm:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};
