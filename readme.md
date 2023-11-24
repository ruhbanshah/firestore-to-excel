# Firestore to Excel

## Introduction

Firestore to Excel is a Node.js utility that allows for the export of data from Firebase Firestore to Excel files. It's designed for easy and flexible Firestore data retrieval and Excel file generation.

## Installation

Ensure you have Node.js installed on your machine. Then install the package using npm:

```
npm install firestore-to-excel
```

## Usage

To use this package, you need a Firebase Service Account JSON file. Ensure this file is accessible to your script.

Basic Command
Run the script with the following command, replacing path-to-your-firebase-service-account.json with the path to your Firebase Service Account JSON file.

```
firestore-to-excel path-to-your-firebase-service-account.json
```

## Script Functions
The script will prompt you for various inputs:

- Firestore collection name.
- Field name for filtering (optional).
- Filter type and value (optional).
- Sort order (optional).
- Maximum number of documents per query (optional, default is 5000).
- Output Excel file name (optional, defaults to output.xlsx).
- Path for local document structure file (optional, for predefined data structure).

The script will then proceed to fetch data from Firestore based on the provided criteria and generate an Excel file.

## Configuration

The package provided a sample document structure file in documentStructure.json to define the structure of the exported Excel file. You can modify this file to match your Firestore data structure.

## API Reference

This package exposes a FirestoreDataExporter class with various methods for fetching data from Firestore, generating Excel files, and handling command-line interactions.

## Contributing

Contributions to improve the package are welcome. Please ensure to follow standard coding practices and provide documentation for your changes.

## License

This package is released under [specify your license here].