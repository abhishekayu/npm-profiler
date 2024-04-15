
# NPM Profiler ℹ

**npm Profiler :** 
A Comprehensive Analysis Command-Line Analysis Tool for Projects.

## Installation 💻

```bash
npm install npm-profiler
```

## Features 🚀
******1. Count Analysis******

Designed to analyze files within a directory and provide insights such as the total number of files, lines of code, React components, React routers, and configuration files.

```bash
┌───────────┬────────────┬────────────┐
│ Extension │ TotalFiles │ TotalLines │
├───────────┼────────────┼────────────┤
│ .js       │ 2          │ 11         │
├───────────┼────────────┼────────────┤
│ .jsx      │ 3          │ 152        │
└───────────┴────────────┴────────────┘

```
#### It can provide you with:

- **Total Lines of Code:**  `5087`
- **Total React Components:**  `14`
- **Total React Routers:**  `3`
- **Total Configuration Files:**  `1`
- **Total Commented Lines:**  `11`


### Usage

**Replace [options] with any combination of the following options:**
- -g: Indicates that the analysis should include all files within the directory.
- -n: Include the node_modules, Dist etc directory to the analysis.
- -w: Include whitespace lines in the line count.
- -d: Download the analysis results as a CSV file named Project-count.csv.
- -c: Count the total number of commented lines.

#### Note: -g is mandatory rest optional.
```bash
ayu-count -g 
```

#

******2. API Analysis******

Designed to analyze API calls within files in a directory. It provides insights such as the total number of API calls, the number of GET and POST calls for both Fetch and Axios.

```bash
┌───────┬─────────────┬───────────┬────────────┐
│ API   │ Total Calls │ GET Calls │ POST Calls │
├───────┼─────────────┼───────────┼────────────┤
│ Fetch │ 5           │ 4         │ 1          │
├───────┼─────────────┼───────────┼────────────┤
│ Axios │ 4           │ 2         │ 2          │
└───────┴─────────────┴───────────┴────────────┘
```

### Usage

**Replace [options] with any combination of the following options:**

- -g: Indicates that the analysis should include all files within the directory.
- -d: Download the analysis results as a CSV file named Api-calls.csv.

#### Note: -g is mandatory rest optional.
```bash
ayu-api -g
```

#

******3. Unused Analysis******

Designed to analyze JavaScript files in a directory and provide insights such as the number of active console.log statements, commented console.log statements, total console.log statements, uncalled functions, and unused packages.

```bash
┌──────────────────────────────┬────────────────────┐
│ Package                      │ Version            │
├──────────────────────────────┼────────────────────┤
│ framer-motion                │ ^11.0.24           │
├──────────────────────────────┼────────────────────┤
│ ora                          │ ^8.0.1             │
├──────────────────────────────┼────────────────────┤
│ react-beautiful-dnd          │ ^13.1.1            │
└──────────────────────────────┴────────────────────┘
```

#### It can provide you with:

- **Total Active console.log Statements:** `15`
- **Total Commented console.log Statements:** `2`
- **Total Console.log Statements:** `17`
- **Total Uncalled Functions:** `3`
- **Total Commented Lines:** `11`
- **Total Unused Packages:** `3`


### Usage

**Replace [options] with any combination of the following options:**

- -g: Indicates that the analysis should include all JavaScript files within the directory.
- -d: Download the analysis results as a CSV file named Unused.csv.

#### Note: -g is mandatory rest optional.
```bash
ayu-free -g
```

#

******4. Size Analysis******

Designed to calculate and display the sizes of directories and subdirectories within a specified root directory. It provides insights into the disk space consumption of various folders, excluding certain predefined folders like node_modules, dist etc.

```bash
┌────────────┬──────────┐
│ Folder     │ Size     │
├────────────┼──────────┤
│ public     │ 1.88 KB  │
├────────────┼──────────┤
│ src        │ 10.17 KB │
├────────────┼──────────┤
│ src\assets │ 4.03 KB  │
└────────────┴──────────┘
```

#### It can provide you with:

- **Total size of the (/) without folders:** `329.31 KB`
- **Size of 'dist':** `147.38 KB`
- **Size of 'node_modules':** `64.14 MB`


### Usage

**Replace [options] with any combination of the following options:**

- -g: Indicates that the analysis should include all directories and subdirectories within the root directory.
- -d: Download the analysis results as a CSV file named Folder-sizes.csv.


#### Note: -g is mandatory rest optional.
```bash
ayu-size -g
```

## Contributor

Abhishek Verma

<a href='https://github.com/abhishekayu' target="_blank">
<img alt='Github' src='https://img.shields.io/badge/github-100000?style=for-the-badge&logo=Github&logoColor=white&labelColor=black&color=black'/>
</a>

<a href="mailto:imdarkcoder@gmail.com" target="_blank">
  <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="email"/>
</a>
 <a href="https://www.linkedin.com/in/abhishek-ayu/" target="_blank">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="abhishekayu"/>
 </a> 

## Important: For any Queries, Suggestions, or Improvements

If you have any questions, feedback, or ideas for improvement, please don't hesitate to raise an issue or submit a pull request on GitHub. Your input is highly valued and helps to enhance this project for everyone. Thank you for your contribution!

## Contribute

Contributions are always welcome!
Please read the [contribution guidelines](https://github.com/jessesquires/.github/blob/main/CONTRIBUTING.md) first.

## License

This project is licensed under the MIT License - see the LICENSE file for details. [MIT](https://choosealicense.com/licenses/mit/)
