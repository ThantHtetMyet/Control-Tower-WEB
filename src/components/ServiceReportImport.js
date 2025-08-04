// In the handleImport function, replace the existing logic with:
const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
        alert('No data to import. Please upload and parse a file first.');
        return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id;

        if (!userId) {
            throw new Error('User not found. Please log in again.');
        }

        // First create the import file record
        const createRecordResponse = await fetch('/api/ImportFileRecords', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                importFormTypeID: selectedImportFormType,
                name: `Import_${new Date().toISOString()}`,
                storedDirectory: uploadedFile?.name || 'Excel Import',
                importedStatus: 'Processing',
                uploadedStatus: 'Completed',
                uploadedDate: new Date().toISOString(),
                uploadedBy: userId,
                createdBy: userId
            })
        });

        if (!createRecordResponse.ok) {
            throw new Error('Failed to create import record');
        }

        const importRecord = await createRecordResponse.json();

        // Process the Excel data through the consolidated endpoint
        const processResponse = await fetch('/api/ImportFileRecords/ProcessImportData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                importFileRecordId: importRecord.id,
                userId: userId,
                excelData: parsedData.map(row => ({
                    location: row.Location,
                    issueReported: row.IssueReported,
                    issueFound: row.IssueFound,
                    actionTaken: row.ActionTaken
                }))
            })
        });

        if (!processResponse.ok) {
            throw new Error('Failed to process import data');
        }

        const results = await processResponse.json();
        setImportResults(results);
        
        alert('Import completed successfully!');
        
    } catch (error) {
        console.error('Import failed:', error);
        alert(`Import failed: ${error.message}`);
    } finally {
        setIsImporting(false);
    }
};