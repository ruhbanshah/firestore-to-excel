#!/usr/bin/env node


const admin = require('firebase-admin');
const Excel = require('exceljs');
const readline = require('readline');
const fs = require('fs')
const path = require('path');
const os = require('os');


class FirestoreDataExporter {
    constructor(serviceAccountPath) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
            });
        }

        this.db = admin.firestore();

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    askQuestion(query) {
        return new Promise(resolve => {
            this.rl.question(query, answer => {
                resolve(answer);
            });
        });
    }

    askQuestionWithOptions(question, options) {
        return new Promise(resolve => {
            // Construct the question string with options
            let questionWithOptions = question + "\n";
            options.forEach((option, index) => {
                questionWithOptions += `${index + 1}. ${option}\n`;
            });
            questionWithOptions += "Enter your choice: ";
    
            this.rl.question(questionWithOptions, answer => {
                resolve(answer);
            });
        });
    }

    async readDocumentStructure(filePath) {
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Error reading document structure file:', error);
            throw error;
        }
    }

    extractRelevantFields(data, structure) {
        let rowData = {};
    
        for (let key in structure) {
            if (data.hasOwnProperty(key)) {
                rowData[key] = Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key];
            } else {
                rowData[key] = structure[key];
            }
        }
    
        return rowData;
    }

    getDownloadsFolderPath() {
        const homeDir = os.homedir();
        if (process.platform === 'win32') {
            // For Windows
            return path.join(homeDir, 'Downloads');
        } else {
            // For macOS and other Unix-like OS
            return path.join(homeDir, 'Downloads');
        }
    }

    async fetchDataToExcel(collectionName,field,filterType,sortBy,maxDocsPerQuery,outputFileName, recordLimit, documentStructure) {
        try {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Data');
    
            let query = this.db.collection(collectionName)
    
    
            switch (filterType) {
                case '1':
                    query=query.where(field,'==',sortBy[0]).orderBy(field);
                    break;
                case '2':
                    query=query.where(field,'!=',sortBy[0]).orderBy(field);
                    break;
                case '3':
                    query=query.where(field,'>',sortBy[0]).orderBy(field);
                    break;
                case '4':
                    query=query.where(field,'>=',sortBy[0]).orderBy(field);
                    break;
                case '5':
                    query=query.where(field,'<',sortBy[0]).orderBy(field);
                    break;
                case '6':
                    query=query.where(field,'<=',sortBy[0]).orderBy(field);
                    break;
                case '7':
                    query=query
                    .where(field,'>=',sortBy[0])
                    .where(field,'<=',sortBy[1])
                    .orderBy(field);
                    break;
                case '8':
                    query=query;
                    break;
                default:
                    query=query;
                    return;
            }
    
    
            query=query.limit(Number(maxDocsPerQuery))
    
            let continueFetching = true;
            let lastDocument = null;
            let fetchedRecords = 0;
    
            while (continueFetching) {
                if (lastDocument) {
                    query = query.startAfter(lastDocument);
                }
    
                const snapshot = await query.get();
    
                if (snapshot.empty) {
                    console.log('No documents found.');
                    break;
                }
    
                if (!documentStructure) {
                    // Dynamically set columns based on the first document, sorted alphabetically
                    documentStructure = Object.keys(snapshot.docs[0].data()).sort()
                        .reduce((acc, key) => ({ ...acc, [key]: '' }), {});
                }
    
                worksheet.columns = Object.keys(documentStructure).map(key => ({
                    header: key,
                    key: key,
                    width: 15 // Customizable width
                }));
    
                snapshot.forEach(doc => {
                    if (recordLimit === 'all' || fetchedRecords < parseInt(recordLimit)) {
                        const rowData = this.extractRelevantFields(doc.data(), documentStructure);
                        worksheet.addRow(rowData);
                        fetchedRecords++;
                        if (fetchedRecords % 100 === 0) {
                            console.log(`Records processed: ${fetchedRecords}`);
                        }
                    }
                });
    
                lastDocument = snapshot.docs[snapshot.docs.length - 1];
                continueFetching = snapshot.docs.length === 5000 && (recordLimit === 'all' || fetchedRecords < parseInt(recordLimit));
    
                // if (snapshot.docs.length < 5000 || (recordLimit !== 'all' && fetchedRecords >= parseInt(recordLimit))) {
                //     break;
                // }
            }

            const downloadsFolder = this.getDownloadsFolderPath();
            const outputFileFullPath = path.join(downloadsFolder, outputFileName);
    
            await workbook.xlsx.writeFile(outputFileFullPath);
            console.log(`Data exported to ${outputFileName}`);
        } catch (error) {
            console.error("Error fetching data and writing to Excel: ", error);
            throw error;
        } finally {
            this.rl.close();
        }
    }

    async main() {
        const collectionName = await this.askQuestion('Enter Firestore collection name: ');
    
        let filterData = await this.askQuestion('Do you require the data to be filtered (y/n): ');
        filterData=filterData.charAt(0)=='y' ? true:false
    
    
        let field=""
        let filterType="8";
    
        if(filterData){
            field = await this.askQuestion('Which field do you require the filtering to be applied on:');
            filterType = await this.askQuestionWithOptions(
                "Choose filter type ", 
                ["Equal to", "Not Equal To", "Greater than","Greater than or equal to","Less than","Less than or equal to","In Between Two Values"]
            );
        }
    
    
        
    
        let sortValue=[]
    
        if(filterData && filterType!="7"){
            sortValue[0] = await this.askQuestion('Enter Sort By field Value: ');
        }
    
        if(filterData && filterType=="7"){
            sortValue[0] = await this.askQuestion('Enter Sort By field Value (Greater than): ');
            sortValue[1] = await this.askQuestion('Enter Sort By field Value (Less than): ');
    
        }
    
        const recordLimit = await this.askQuestion('Enter number of records to fetch (type "all" for fetching all records): ');
    
        let maxDocsPerQuery=5000;
        
        if(recordLimit<=5000 || recordLimit=="all"){
            maxDocsPerQuery = await this.askQuestion('How many documents do you want to fetch per query (Max: 10000, Default:5000):');
        }
        
        if (!maxDocsPerQuery.trim()) {
            maxDocsPerQuery=5000
        };
    
    
        let outputFileName = await this.askQuestion('Enter output Excel file name (leave blank for "output.xlsx"): ');
        if (!outputFileName.trim()) {
            outputFileName = 'output.xlsx';
        }
    
        let documentStructure;
        const structureFilePath = await this.askQuestion('Enter path for local document structure file (leave blank to generate dynamically): ');
    
        if (structureFilePath) {
            console.log('Reading document structure from provided file...');
            documentStructure = await this.readDocumentStructure(structureFilePath.trim());
        }
    
        await this.fetchDataToExcel(collectionName, field,filterType,sortValue,Number(maxDocsPerQuery),outputFileName, recordLimit, documentStructure);
    }
    

    // ... rest of your methods ...
}

if (require.main === module) {
    // Process command line arguments
    const args = process.argv.slice(2); // Skip the first two default arguments
    const serviceAccountPath = args[0]; // Assuming the first argument is the service account path

    // Validate the service account path
    if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
        console.error('Error: Firebase service account file path must be provided and valid.');
        process.exit(1);
    }

    // Define the path to the service account file
    // const serviceAccountPath = path.join(__dirname, 'path-to-your-firebase-service-account.json');

    // // Ensure the file exists
    // if (!fs.existsSync(serviceAccountPath)) {
    //     console.error('Firebase service account file not found.');
    //     process.exit(1);
    // }

    const exporter = new FirestoreDataExporter(serviceAccountPath);
    exporter.main().catch(console.error);
}

module.exports = FirestoreDataExporter;










// main();
