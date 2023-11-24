# Firestore to Excel

## Description

Firestore to Excel is a Node.js utility designed to facilitate the export of data from Firebase Firestore to Excel files. This tool is ideal for users who need to manipulate or analyze Firestore data in a spreadsheet format.

## Features

- Fetch data from Firestore collections based on custom queries.
- Filter and sort data from Firestore.
- Export data to Excel files with customizable structure.

## Installation

```
npm install firestore-to-excel
```

## Usage

### Setup

- Clone the repository to your local machine:
```
git clone [repository-link]
```

- Navigate to the cloned directory:
```
cd firestore-to-excel
```

- Install dependencies:
```
npm install
```

- Running the Script
Execute the script with Node.js, providing the path to your Firebase Service Account JSON file:

```
firestore-to-excel path-to-your-firebase-service-account.json
```

### Follow the command-line prompts to specify:

- Firestore collection name.
- Filter and sorting criteria (optional).
- Output Excel file details.

### Command Line Interface
The tool provides an interactive CLI to guide you through the necessary steps to export your data.

### Configuration

Customize the export structure by editing the documentStructure.json file to match your Firestore data schema.

### API Reference

The FirestoreDataExporter class offers various methods for interacting with Firestore and generating Excel files. Explore the index.js file for detailed method descriptions and usage.

## Contributing

We welcome contributions! If you have a suggestion or improvement, please:

- Fork the repository.
- Create a new branch for your feature.
- Commit your changes.
- Push to the branch.
- Open a pull request.

## License
MIT Licence
