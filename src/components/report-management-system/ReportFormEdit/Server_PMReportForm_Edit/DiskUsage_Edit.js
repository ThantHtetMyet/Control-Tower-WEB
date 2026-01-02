import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  ExpandMore as ExpandMoreIcon,
  Undo as UndoIcon,
} from '@mui/icons-material';
import serverDiskStatusService from '../../../api-services/serverDiskStatusService';
import resultStatusService from '../../../api-services/resultStatusService';
// Import the warehouse service
import warehouseService from '../../../api-services/warehouseService';

const DiskUsage_Edit = ({ data, onDataChange, onStatusChange, stationNameWarehouseID }) => {
  const [servers, setServers] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [serverDiskStatusOptions, setServerDiskStatusOptions] = useState([]);
  const [resultStatusOptions, setResultStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverHostNameOptions, setServerHostNameOptions] = useState([]);
  const [loadingServerHostNames, setLoadingServerHostNames] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const isInitialized = useRef(false);
  const onDataChangeTimeoutRef = useRef(null);

  // Initialize data from props when meaningful data is available
  useEffect(() => {
    
    // Only initialize once
    if (isInitialized.current) return;
    
    // Check if we have meaningful data to initialize with - following HardDriveHealth_Edit pattern
    // Accept data even if servers array is empty, as long as the data object exists
    const hasData = data && (
      (data.servers !== undefined) || // Accept even empty servers array
      (data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0) ||
      (data.remarks !== undefined) // Accept even empty remarks
    );
    if (hasData) {
      
      // Handle API response format (pmServerDiskUsageHealths) - similar to DiskUsage_Review flexible approach
      if (data.pmServerDiskUsageHealths && data.pmServerDiskUsageHealths.length > 0) {
        const apiData = data.pmServerDiskUsageHealths[0]; // Get first item from array
        
        // Group details by serverName to create server structure
        const serverMap = new Map();
        
        if (apiData.details && apiData.details.length > 0) {
          console.log('DiskUsage_Edit - Processing details, count:', apiData.details.length); // Debug log
          apiData.details.forEach((detail, index) => {
            console.log(`DiskUsage_Edit - Processing detail ${index}:`, detail); // Debug log
            const serverName = detail.serverName;
            
            // Use ServerEntryIndex from database to distinguish duplicate server names
            // If ServerEntryIndex is not available, use a combination of serverName and index
            const serverEntryIndex = detail.serverEntryIndex !== null && detail.serverEntryIndex !== undefined
              ? detail.serverEntryIndex
              : (detail.ServerEntryIndex !== null && detail.ServerEntryIndex !== undefined ? detail.ServerEntryIndex : index);
            
            // Allow duplicate server names by using ServerEntryIndex + serverName as unique key
            // This ensures each server entry from API is treated separately
            const serverKey = `${serverName}-entry-${serverEntryIndex}`;
            if (!serverMap.has(serverKey)) {
              console.log(`DiskUsage_Edit - Creating new server entry for: ${serverName} (key: ${serverKey}, entryIndex: ${serverEntryIndex})`); // Debug log
              serverMap.set(serverKey, {
                id: detail.pmServerDiskUsageHealthID, // Use the parent ID
                tempId: `api-${detail.pmServerDiskUsageHealthID || index}-entry-${serverEntryIndex}`, // Generate unique temp ID with entry index
                serverName: serverName,
                serverEntryIndex: serverEntryIndex, // Preserve ServerEntryIndex from database
                disks: [],
                isNew: false,
                isModified: false,
                isDeleted: false
              });
            }
            
            // Add disk to the server
            const diskEntry = {
              id: detail.id,
              disk: detail.diskName || '',
              status: detail.serverDiskStatusID || '',
              capacity: detail.capacity || '',
              freeSpace: detail.freeSpace || '',
              usage: detail.usage || '',
              check: detail.resultStatusID || '',
              remarks: detail.remarks || '',
              isNew: false,
              isModified: false,
              isDeleted: false
            };
            console.log(`DiskUsage_Edit - Adding disk to ${serverName} (key: ${serverKey}):`, diskEntry); // Debug log
            serverMap.get(serverKey).disks.push(diskEntry);
          });
        }
        
        const mappedServers = Array.from(serverMap.values());
        console.log('DiskUsage_Edit - Final mapped servers from API:', mappedServers); // Debug log
        console.log('DiskUsage_Edit - Server count:', mappedServers.length); // Debug log
        setServers(mappedServers);
        
        // Set remarks from API data
        console.log('DiskUsage_Edit - API remarks:', apiData.remarks); // Debug log
        if (apiData.remarks) {
          setRemarks(apiData.remarks);
        }
      }
      // Handle legacy/direct data format (servers array) - following HardDriveHealth_Edit pattern
      else if (data.servers && data.servers.length > 0) {
        console.log('DiskUsage_Edit - Processing legacy/direct data'); // Debug log
        // Map existing data and preserve all tracking flags including isDeleted
        const mappedServers = data.servers.map((server, index) => ({
          id: server.id || null, // preserve existing ID or null for new items - following HardDriveHealth_Edit pattern
          tempId: server.tempId || (server.id ? `existing-${server.id}` : `temp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`), // Generate unique temp ID for tracking
          serverName: server.serverName || '',
          serverEntryIndex: server.serverEntryIndex !== null && server.serverEntryIndex !== undefined 
            ? server.serverEntryIndex 
            : index, // Preserve ServerEntryIndex or use array index as fallback
          disks: server.disks ? server.disks.map(disk => ({
            id: disk.id || null,
            disk: disk.disk || '',
            status: disk.status || '',
            capacity: disk.capacity || '',
            freeSpace: disk.freeSpace || '',
            usage: disk.usage || '',
            check: disk.check || '',
            remarks: disk.remarks || '',
            isNew: !disk.id, // mark as new if no ID exists - following HardDriveHealth_Edit pattern
            isModified: disk.isModified || false, // preserve modification flag
            isDeleted: disk.isDeleted || false // preserve deletion flag
          })) : [],
          isNew: !server.id, // mark as new if no ID exists - following HardDriveHealth_Edit pattern
          isModified: server.isModified || false, // preserve modification flag
          isDeleted: server.isDeleted || false // preserve deletion flag
        }));
        console.log('DiskUsage_Edit - Mapped servers from legacy/direct:', mappedServers); // Debug log
        setServers(mappedServers);
      }
      
      // Handle remarks from any format - following DiskUsage_Review flexible approach
      if (data.remarks) {
        setRemarks(data.remarks);
      } else if (data.diskUsageRemarks) {
        setRemarks(data.diskUsageRemarks);
      } else if (data.comment) {
        setRemarks(data.comment);
      }
    } else if (!hasData) {
      // Initialize with empty state if no data provided - following HardDriveHealth_Edit pattern
      console.log('DiskUsage_Edit - No data provided, initializing empty state'); // Debug log
      setServers([]);
      setRemarks('');
    }
    
    // Always mark as initialized after first render, even if no data
    // This ensures onDataChange will be called when user fills in data
    isInitialized.current = true;
  }, [data]);

  // Fetch Server Disk Status options
  useEffect(() => {
    const fetchServerDiskStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await serverDiskStatusService.getServerDiskStatuses();
        setServerDiskStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Server Disk Status options:', error);
        setServerDiskStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServerDiskStatusOptions();
  }, []);

  // Fetch Result Status options
  useEffect(() => {
    const fetchResultStatusOptions = async () => {
      try {
        setLoading(true);
        const response = await resultStatusService.getResultStatuses();
        setResultStatusOptions(response || []);
      } catch (error) {
        console.error('Error fetching Result Status options:', error);
        setResultStatusOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultStatusOptions();
  }, []);

  // Fetch Server Host Name options when stationNameWarehouseID changes
  useEffect(() => {
    const fetchServerHostNames = async () => {
      if (!stationNameWarehouseID || stationNameWarehouseID.trim() === '') {
        setServerHostNameOptions([]);
        return;
      }

      try {
        setLoadingServerHostNames(true);
        const stationID = stationNameWarehouseID.trim();
        const response = await warehouseService.getServerHostNameWarehouses(stationID);
        const fetchedOptions = Array.isArray(response) ? response : [];
        
        // Get existing server names from current data
        const existingServerNames = servers
          .filter(server => server.serverName && server.serverName.trim() !== '' && !server.isDeleted)
          .map(server => server.serverName.trim());
        
        // Create a map to avoid duplicates
        const optionsMap = new Map();
        
        // First, add ALL fetched options from API
        fetchedOptions.forEach(option => {
          const optionName = option.name || option.Name;
          if (option && optionName) {
            optionsMap.set(optionName, { id: option.id || option.ID || `api-${optionName}`, name: optionName });
          }
        });
        
        // Then, add existing server names that are not in the fetched options
        existingServerNames.forEach(serverName => {
          if (!optionsMap.has(serverName)) {
            optionsMap.set(serverName, { id: `existing-${serverName}`, name: serverName });
          }
        });
        
        // Convert map back to array
        const finalOptions = Array.from(optionsMap.values());
        setServerHostNameOptions(finalOptions);
      } catch (error) {
        console.error('Error fetching server host name options:', error);
        // Even on error, include existing server names so current values are visible
        const existingServerNames = servers
          .filter(server => server.serverName && server.serverName.trim() !== '' && !server.isDeleted)
          .map(server => server.serverName.trim());
        const existingOptions = existingServerNames.map(name => ({ id: `existing-${name}`, name }));
        setServerHostNameOptions(existingOptions);
      } finally {
        setLoadingServerHostNames(false);
      }
    };

    fetchServerHostNames();
  }, [stationNameWarehouseID]); // Only fetch when stationNameWarehouseID changes, not when data changes

  // Merge existing server names into options when data changes (without re-fetching)
  // Debounced to reduce unnecessary updates
  useEffect(() => {
    if (servers.length > 0) {
      const timeoutId = setTimeout(() => {
        const existingServerNames = servers
          .filter(server => server.serverName && server.serverName.trim() !== '' && !server.isDeleted)
          .map(server => server.serverName.trim());
        
        if (existingServerNames.length > 0) {
          // Use functional setState to avoid dependency on serverHostNameOptions
          setServerHostNameOptions(prevOptions => {
            const optionsMap = new Map(prevOptions.map(opt => [
              String(opt.name || opt.Name || '').trim(),
              opt
            ]));
            
            // Add existing server names that aren't already in options
            let hasChanges = false;
            existingServerNames.forEach(serverName => {
              if (!optionsMap.has(serverName)) {
                optionsMap.set(serverName, { id: `existing-${serverName}`, name: serverName });
                hasChanges = true;
              }
            });
            
            // Only return new array if there are changes to avoid unnecessary re-renders
            return hasChanges ? Array.from(optionsMap.values()) : prevOptions;
          });
        }
      }, 200); // Debounce to reduce updates while typing
      
      return () => clearTimeout(timeoutId);
    }
  }, [servers]); // Only merge existing names when data changes

  // Utility functions for snackbar
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Update parent component when data changes (but not on initial load)
  // Debounced to prevent excessive re-renders while typing
  useEffect(() => {
    if (isInitialized.current && onDataChange) {
      // Clear any pending timeout
      if (onDataChangeTimeoutRef.current) {
        clearTimeout(onDataChangeTimeoutRef.current);
      }
      
      // Debounce the onDataChange call to reduce parent re-renders
      onDataChangeTimeoutRef.current = setTimeout(() => {
        const dataToSend = {
          servers,
          remarks,
          resultStatusOptions,
          serverDiskStatusOptions
        };
        console.log('DiskUsage_Edit - Sending data to parent (debounced):', dataToSend);
        onDataChange(dataToSend);
      }, 300); // 300ms debounce delay
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (onDataChangeTimeoutRef.current) {
        clearTimeout(onDataChangeTimeoutRef.current);
      }
    };
  }, [servers, remarks, resultStatusOptions, serverDiskStatusOptions, onDataChange]);

  // Calculate completion status
  useEffect(() => {
    const activeServers = servers.filter(server => !server.isDeleted);
    const hasServerData = activeServers.some(server => {
      const activeDisks = server.disks.filter(disk => !disk.isDeleted);
      return server.serverName.trim() !== '' && activeDisks.some(disk => 
        disk.disk.trim() !== '' && disk.status !== '' && disk.check !== ''
      );
    });
    const hasRemarks = remarks.trim() !== '';
    
    const isCompleted = hasServerData && hasRemarks;
    
    if (onStatusChange) {
      onStatusChange('DiskUsage_Edit', isCompleted);
    }
  }, [servers, remarks, onStatusChange]);

  // Server management handlers
  // Helper function to cascade operations to all disks in a server
  const cascadeOperationToDisks = (server, operation) => {
    return server.disks.map(disk => {
      switch (operation) {
        case 'delete':
          return {
            ...disk,
            isDeleted: true,
            isModified: disk.id ? true : disk.isModified
          };
        case 'restore':
          return {
            ...disk,
            isDeleted: false,
            isModified: disk.id ? true : disk.isModified
          };
        case 'markAsNew':
          return {
            ...disk,
            isNew: true
          };
        default:
          return disk;
      }
    });
  };

  // Memoize addServer to prevent unnecessary re-renders
  const addServer = useCallback(() => {
    setServers(prevServers => {
      // Generate a unique temporary ID for this server entry
      // This allows duplicate server names to be treated as separate entries
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      // Assign serverEntryIndex based on the current number of servers
      // This ensures duplicate server names can be distinguished
      // Use functional update to get the current servers length
      const serverEntryIndex = prevServers.length;
      const newServer = {
        id: null, // null indicates new server (will be set by backend on save)
        tempId: tempId, // Unique identifier for frontend tracking
        serverName: '',
        serverEntryIndex: serverEntryIndex, // Track server entry index for duplicate server names
        disks: [],
        isNew: true // flag to track new servers
      };
      showSnackbar('Server added successfully', 'success');
      return [...prevServers, newServer];
    });
  }, []);

  const removeServer = (serverIndex) => {
    setServers(prevServers => {
      const updatedServers = [...prevServers];
      const server = updatedServers[serverIndex];
      
      if (server.id) {
        // Mark existing server as deleted and cascade to all disks
        const updatedDisks = cascadeOperationToDisks(server, 'delete');
        
        updatedServers[serverIndex] = {
          ...server,
          isDeleted: true,
          isModified: true,
          disks: updatedDisks
        };
        showSnackbar('Server and all its disks deleted. Click undo to restore.', 'warning');
      } else {
        // Remove new server completely
        updatedServers.splice(serverIndex, 1);
        showSnackbar('New server removed');
      }
      
      return updatedServers;
    });
  };

  const restoreServer = (serverIndex) => {
    setServers(prevServers => {
      const updatedServers = [...prevServers];
      const server = updatedServers[serverIndex];
      
      // Only restore if server is currently deleted
      if (server.isDeleted) {
        // Restore server and cascade to all disks
        const updatedDisks = cascadeOperationToDisks(server, 'restore');
        
        updatedServers[serverIndex] = {
          ...server,
          isDeleted: false,
          isModified: true, // Keep as modified since we're changing the delete status
          disks: updatedDisks
        };
        showSnackbar('Server and all its disks restored successfully', 'success');
        return updatedServers;
      }
      return prevServers;
    });
  };

  // Memoize updateServerName to prevent unnecessary re-renders
  const updateServerName = useCallback((serverIndex, serverName) => {
    setServers(prevServers => {
      const updatedServers = [...prevServers];
      const server = updatedServers[serverIndex];
      
      // Prevent updates to deleted servers
      if (server.isDeleted) {
        showSnackbar('Cannot modify a deleted server. Please restore the server first.', 'error');
        return prevServers; // Return unchanged state
      }
      
      // Mark as modified if it's an existing server (has ID) and value changed
      const isModified = server.id && server.serverName !== serverName;
      
      updatedServers[serverIndex] = {
        ...server,
        serverName,
        isModified: isModified || server.isModified
      };
      
      return updatedServers;
    });
  }, []);

  // Disk management handlers
  // Memoize addDisk to prevent unnecessary re-renders
  const addDisk = useCallback((serverIndex) => {
    setServers(prevServers => {
      const updatedServers = [...prevServers];
      const server = updatedServers[serverIndex];
      
      // Prevent adding disks to deleted servers
      if (server.isDeleted) {
        showSnackbar('Cannot add disk to a deleted server. Please restore the server first.', 'error');
        return prevServers; // Return unchanged state
      }
      
      const newDisk = {
        id: null, // null indicates new disk
        disk: '',
        status: '',
        capacity: '',
        freeSpace: '',
        usage: '',
        check: '',
        remarks: '', // Add remarks field for new disks
        isNew: true, // Always true for new disks (id is null)
        isModified: false,
        isDeleted: false
      };
      
      updatedServers[serverIndex] = {
        ...updatedServers[serverIndex],
        disks: [...updatedServers[serverIndex].disks, newDisk]
      };
      
      showSnackbar('Disk added successfully', 'success');
      return updatedServers;
    });
  }, []);

  const removeDisk = (serverIndex, diskIndex) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    const disk = server.disks[diskIndex];
    
    // Prevent individual disk operations on deleted servers
    if (server.isDeleted) {
      showSnackbar('Cannot modify disks of a deleted server. Please restore the server first.', 'error');
      return;
    }
    
    if (disk.id) {
      // Mark existing disk as deleted
      const updatedDisks = [...server.disks];
      updatedDisks[diskIndex] = {
        ...disk,
        isDeleted: true,
        isModified: true
      };
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
      showSnackbar('Disk deleted. Click undo to restore.', 'warning');
    } else {
      // Remove new disk completely
      const updatedDisks = server.disks.filter((_, index) => index !== diskIndex);
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
      showSnackbar('New disk removed');
    }
    
    setServers(updatedServers);
  };

  const restoreDisk = (serverIndex, diskIndex) => {
    const updatedServers = [...servers];
    const server = updatedServers[serverIndex];
    const disk = server.disks[diskIndex];
    
    // Prevent individual disk restoration if server is deleted
    if (server.isDeleted) {
      showSnackbar('Cannot restore individual disks of a deleted server. Please restore the server first.', 'error');
      return;
    }
    
    // Only restore if disk is currently deleted
    if (disk.isDeleted) {
      const updatedDisks = [...server.disks];
      updatedDisks[diskIndex] = {
        ...disk,
        isDeleted: false,
        isModified: true // Keep as modified since we're changing the delete status
      };
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
      setServers(updatedServers);
      showSnackbar('Disk restored successfully', 'success');
    }
  };

  // Memoize updateDiskField to prevent unnecessary re-renders
  const updateDiskField = useCallback((serverIndex, diskIndex, field, value) => {
    setServers(prevServers => {
      const updatedServers = [...prevServers];
      const server = updatedServers[serverIndex];
      const disk = server.disks[diskIndex];
      
      // Prevent field updates on deleted servers or deleted disks
      if (server.isDeleted) {
        showSnackbar('Cannot modify disks of a deleted server. Please restore the server first.', 'error');
        return prevServers; // Return unchanged state
      }
      
      if (disk.isDeleted) {
        showSnackbar('Cannot modify a deleted disk. Please restore the disk first.', 'error');
        return prevServers; // Return unchanged state
      }
      
      // Mark as modified if it's an existing disk (has ID) and value changed
      const isModified = disk.id && disk[field] !== value;
      
      const updatedDisks = [...server.disks];
      updatedDisks[diskIndex] = {
        ...disk,
        [field]: value,
        isModified: isModified || disk.isModified
      };
      
      updatedServers[serverIndex] = {
        ...server,
        disks: updatedDisks
      };
      
      return updatedServers;
    });
  }, []);

  // Styling
  const sectionContainerStyle = {
    padding: 3,
    marginBottom: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const sectionHeaderStyle = {
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1
  };

  const instructionBoxStyle = {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderRadius: 1,
    marginBottom: 3,
    border: '1px solid #e0e0e0'
  };

  const noteBoxStyle = {
    backgroundColor: '#fff3cd',
    padding: 2,
    borderRadius: 1,
    marginBottom: 3,
    border: '1px solid #ffeaa7',
    borderLeft: '4px solid #fdcb6e'
  };

  return (
    <Paper sx={sectionContainerStyle}>
      <Typography variant="h5" sx={sectionHeaderStyle}>
        <StorageIcon /> Server Disk Usage Check
      </Typography>
      
      {/* Instructions */}
      <Box sx={instructionBoxStyle}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Using Computer Management
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>From Control Panel→Administration Tools→Computer Management.</li>
            <li>click on the Storage→Disk Management. check the Status for all the hard disk</li>
          </ul>
        </Typography>
      </Box>

      {/* Note for HDSRS Servers */}
      <Box sx={noteBoxStyle}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          📌 Note for HDSRS Servers:
        </Typography>
        <Typography variant="body2">
          For HDSRS servers, please also check the disk usage using the HDSRS monitoring interface 
          to ensure historical data storage is within acceptable limits.
        </Typography>
      </Box>

      {/* Add Server Button */}
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addServer}
        sx={{ marginBottom: 2 }}
      >
        Add Server
      </Button>

      {/* Servers */}
      {(() => {
        // Pre-calculate duplicate counts once instead of in each map iteration
        // This is moved outside the map to avoid recalculating on every render
        const serverNameCounts = {};
        servers.forEach(s => {
          if (!s.isDeleted && s.serverName) {
            serverNameCounts[s.serverName] = (serverNameCounts[s.serverName] || 0) + 1;
          }
        });
        
        return servers.map((server, serverIndex) => {
          // Use tempId + serverEntryIndex or id + serverEntryIndex for unique key to ensure separate entries for duplicate server names
          // This ensures that even if two servers have the same name, they have different keys
          const uniqueKey = server.tempId 
            ? `${server.tempId}-entry-${server.serverEntryIndex ?? serverIndex}` 
            : (server.id 
              ? `${server.id}-entry-${server.serverEntryIndex ?? serverIndex}` 
              : `server-${serverIndex}-entry-${server.serverEntryIndex ?? serverIndex}`);
          // Use pre-calculated count instead of filtering on each render
          const duplicateCount = serverNameCounts[server.serverName] || 0;
          const isDuplicate = duplicateCount > 1;
        
        return (
        <Accordion 
          key={uniqueKey} 
          defaultExpanded 
          sx={{ 
            marginBottom: 2,
            position: 'relative',
            opacity: server.isDeleted ? 0.5 : 1,
            backgroundColor: server.isDeleted ? '#ffcdd2' : 'transparent',
            border: server.isDeleted ? '3px solid #f44336' : 'none',
            borderRadius: server.isDeleted ? '8px' : 'inherit',
            transform: server.isDeleted ? 'scale(0.98)' : 'scale(1)',
            transition: 'all 0.3s ease-in-out',
            '&::before': server.isDeleted ? {
              content: '"❌ DELETED"',
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)',
            } : {},
            '&::after': server.isDeleted ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                linear-gradient(135deg, transparent 47%, #f44336 47%, #f44336 53%, transparent 53%),
                linear-gradient(45deg, transparent 47%, #f44336 47%, #f44336 53%, transparent 53%)
              `,
              zIndex: 1,
              pointerEvents: 'none',
              opacity: 0.8
            } : {}
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              {(() => {
                // Compute complete options list including current value for this server
                const currentValue = String(server.serverName || '').trim();
                const optionsWithCurrent = [...serverHostNameOptions];
                
                // Always include current value in options if it exists and is not already there
                if (currentValue && currentValue !== '' && !optionsWithCurrent.some(opt => {
                  const optName = String(opt.name || opt.Name || '').trim();
                  return optName === currentValue;
                })) {
                  optionsWithCurrent.push({ 
                    id: `current-${currentValue}`, 
                    name: currentValue 
                  });
                }
                
                // Since we always add currentValue to optionsWithCurrent if it exists,
                // the value should always be valid if currentValue is not empty
                const selectValue = currentValue && currentValue !== '' ? currentValue : '';
                
                return (
                  <FormControl size="small" sx={{ minWidth: '200px' }}>
                    <InputLabel id={`disk-usage-server-name-label-${serverIndex}`} shrink>
                      Server Name
                    </InputLabel>
                    <Select
                      labelId={`disk-usage-server-name-label-${serverIndex}`}
                      value={selectValue}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateServerName(serverIndex, String(e.target.value || '').trim());
                      }}
                      onClick={(e) => e.stopPropagation()}
                      label="Server Name"
                      disabled={server.isDeleted || loadingServerHostNames}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          fontSize: '1rem',
                          fontWeight: '500'
                        },
                        '&:hover': {
                          backgroundColor: '#e9ecef',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2'
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: '#ffffff',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }
                      }}
                    >
                      {loadingServerHostNames ? (
                        <MenuItem disabled value="">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={16} />
                            Loading server names...
                          </Box>
                        </MenuItem>
                      ) : optionsWithCurrent.length === 0 ? (
                        !stationNameWarehouseID ? (
                          <MenuItem disabled value="">
                            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                              Please select Station Name first
                            </Typography>
                          </MenuItem>
                        ) : (
                          <MenuItem disabled value="">
                            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                              No server names available
                            </Typography>
                          </MenuItem>
                        )
                      ) : (
                        [
                          <MenuItem key="empty-placeholder" value="">
                            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>
                              Select Server Name
                            </Typography>
                          </MenuItem>,
                          ...optionsWithCurrent.map((option) => {
                            const optionName = String(option.name || option.Name || '').trim();
                            const optionId = String(option.id || option.ID || optionName);
                            return (
                              <MenuItem key={optionId} value={optionName}>
                                {optionName}
                              </MenuItem>
                            );
                          })
                        ]
                      )}
                    </Select>
                  </FormControl>
                );
              })()}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeServer(serverIndex);
                  }}
                  color="error"
                  size="medium"
                  disabled={server.isDeleted}
                  sx={{
                    backgroundColor: server.isDeleted ? 'transparent' : '#ffebee',
                    border: server.isDeleted ? 'none' : '2px solid #f44336',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '44px',
                    minHeight: '44px',
                    '&:hover': {
                      backgroundColor: server.isDeleted ? 'transparent' : '#f44336',
                      color: server.isDeleted ? 'inherit' : 'white',
                      transform: server.isDeleted ? 'none' : 'scale(1.1)',
                      boxShadow: server.isDeleted ? 'none' : '0 4px 12px rgba(244, 67, 54, 0.4)',
                    },
                    '&:active': {
                      transform: server.isDeleted ? 'none' : 'scale(0.95)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <DeleteIcon sx={{ 
                    fontSize: '20px',
                    color: server.isDeleted ? '#ccc' : 'inherit'
                  }} />
                </IconButton>
                
                {server.isDeleted && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreServer(serverIndex);
                    }}
                    color="success"
                    size="medium"
                    sx={{
                      backgroundColor: '#e8f5e8',
                      border: '2px solid #4caf50',
                      borderRadius: '8px',
                      padding: '8px',
                      minWidth: '44px',
                      minHeight: '44px',
                      position: 'relative',
                      zIndex: 2, // Above the strikethrough line
                      '&:hover': {
                        backgroundColor: '#4caf50',
                        color: 'white',
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <UndoIcon sx={{ fontSize: '20px' }} />
                  </IconButton>
                )}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ 
            pointerEvents: server.isDeleted ? 'none' : 'auto',
            opacity: server.isDeleted ? 0.7 : 1 
          }}>
            {/* Add Disk Button */}
            <Box sx={{ marginBottom: 2 }}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => addDisk(serverIndex)}
                size="small"
                disabled={server.isDeleted}
              >
                Add Disk
              </Button>
            </Box>

            {/* Disks Table */}
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Disk</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Capacity (GB)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Free Space (GB)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usage %</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Check (Usage &lt; 50%)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {server.disks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', fontStyle: 'italic', color: '#666' }}>
                        No disks added yet. Click "Add Disk" to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    server.disks.map((disk, diskIndex) => (
                      <TableRow 
                        key={diskIndex}
                        sx={{
                          position: 'relative',
                          opacity: disk.isDeleted ? 0.6 : 1,
                          backgroundColor: disk.isDeleted ? '#ffebee' : 'transparent',
                          '&::after': disk.isDeleted ? {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: '#d32f2f',
                            zIndex: 1,
                            pointerEvents: 'none'
                          } : {}
                        }}
                      >
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.disk}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'disk', e.target.value)}
                            placeholder="e.g., C:"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={disk.status}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'status', e.target.value)}
                            variant="outlined"
                            disabled={loading || disk.isDeleted || server.isDeleted}
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="">
                              {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CircularProgress size={16} />
                                  Loading...
                                </Box>
                              ) : (
                                'Select Status'
                              )}
                            </MenuItem>
                            {serverDiskStatusOptions.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.capacity}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'capacity', e.target.value)}
                            placeholder="e.g., 500GB"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.freeSpace}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'freeSpace', e.target.value)}
                            placeholder="e.g., 200GB"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={disk.usage}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'usage', e.target.value)}
                            placeholder="e.g., 60%"
                            variant="outlined"
                            disabled={disk.isDeleted || server.isDeleted}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={disk.check}
                            onChange={(e) => updateDiskField(serverIndex, diskIndex, 'check', e.target.value)}
                            variant="outlined"
                            disabled={loading || disk.isDeleted || server.isDeleted}
                            sx={{ minWidth: 100 }}
                          >
                            <MenuItem value="">
                              {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CircularProgress size={16} />
                                  Loading...
                                </Box>
                              ) : (
                                'Select'
                              )}
                            </MenuItem>
                            {resultStatusOptions.map((option) => (
                              <MenuItem key={option.id} value={option.id}>
                                {option.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!disk.isDeleted && !server.isDeleted && (
                              <IconButton
                                onClick={() => removeDisk(serverIndex, diskIndex)}
                                color="error"
                                size="small"
                                disabled={server.isDeleted || disk.isDeleted}
                                sx={{
                                  backgroundColor: (disk.isDeleted || server.isDeleted) ? 'transparent' : '#ffebee',
                                  border: (disk.isDeleted || server.isDeleted) ? 'none' : '2px solid #f44336',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  minWidth: '40px',
                                  minHeight: '40px',
                                  boxShadow: (disk.isDeleted || server.isDeleted) ? 'none' : '0 4px 8px rgba(244, 67, 54, 0.3)',
                                  transition: 'all 0.3s ease',
                                  animation: (disk.isDeleted || server.isDeleted) ? 'none' : 'pulse 2s infinite',
                                  '&:hover': {
                                    backgroundColor: (disk.isDeleted || server.isDeleted) ? 'transparent' : '#ffcdd2',
                                    transform: (disk.isDeleted || server.isDeleted) ? 'none' : 'scale(1.1)',
                                    boxShadow: (disk.isDeleted || server.isDeleted) ? 'none' : '0 6px 12px rgba(244, 67, 54, 0.4)'
                                  },
                                  '@keyframes pulse': {
                                    '0%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' },
                                    '50%': { boxShadow: '0 6px 16px rgba(244, 67, 54, 0.5)' },
                                    '100%': { boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)' }
                                  }
                                }}
                              >
                                <DeleteIcon sx={{ 
                                  fontSize: '20px',
                                  color: (disk.isDeleted || server.isDeleted) ? '#ccc' : '#f44336'
                                }} />
                              </IconButton>
                            )}
                            {disk.isDeleted && !server.isDeleted && (
                              <IconButton
                                onClick={() => restoreDisk(serverIndex, diskIndex)}
                                sx={{
                                  backgroundColor: '#e8f5e8',
                                  border: '2px solid #4caf50',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  minWidth: '40px',
                                  minHeight: '40px',
                                  boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)',
                                  transition: 'all 0.3s ease',
                                  animation: 'pulse 2s infinite',
                                  zIndex: 2,
                                  '&:hover': {
                                    backgroundColor: '#c8e6c9',
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 6px 12px rgba(76, 175, 80, 0.4)'
                                  },
                                  '@keyframes pulse': {
                                    '0%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' },
                                    '50%': { boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)' },
                                    '100%': { boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)' }
                                  }
                                }}
                              >
                                <UndoIcon sx={{ 
                                  fontSize: '20px',
                                  color: '#4caf50'
                                }} />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        );
        });
      })()}

      {/* Remarks Section */}
      <Box sx={{ marginTop: 3 }}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#1976d2', fontWeight: 'bold' }}>
          📝 Remarks
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter any additional remarks or observations..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
            }
          }}
        />
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DiskUsage_Edit;