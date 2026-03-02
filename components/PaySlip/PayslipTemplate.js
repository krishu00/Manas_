// import React,{useRef} from "react";
// import {
// View,
// Text,
// Image,
// StyleSheet,
// ScrollView
// } from "react-native";

// import ViewShot from "react-native-view-shot";
// import RNHTMLtoPDF from "react-native-html-to-pdf";

// import companyLogo from "../Company Logos/logo.png";

// import {ToWords} from "to-words";

// const MONTH_MAP={
// 1:"January",
// 2:"February",
// 3:"March",
// 4:"April",
// 5:"May",
// 6:"June",
// 7:"July",
// 8:"August",
// 9:"September",
// 10:"October",
// 11:"November",
// 12:"December"
// };

// const PayslipTemplate=({payslipResponse})=>{

// const ref=useRef();

// const {companyDetails,employeeDetails,payslips}
// =payslipResponse;

// const payslip=payslips[0];

// const earnings=payslip.salaryDetails
// .filter(x=>x.type==="Earning")
// .map(x=>[x.name,x.calculatedAmount]);

// const deductions=payslip.salaryDetails
// .filter(x=>x.type==="Deduction")
// .map(x=>[x.name,x.calculatedAmount]);

// const maxLength=Math.max(
// earnings.length,
// deductions.length
// );

// const toWords=new ToWords({
// localeCode:"en-IN"
// });

// const netWords=
// toWords.convert(payslip.netPay);

// return(

// <ScrollView>

// <ViewShot
// ref={ref}
// options={{format:"png"}}
// >

// <View style={styles.template}>


// <View style={styles.header}>

// <Image
// source={companyLogo}
// style={styles.logo}
// />

// <Text style={styles.company}>
// {companyDetails.name}
// </Text>

// </View>


// <Text style={styles.title}>

// Pay Slip -
// {MONTH_MAP[payslip.month]}
// {" "}
// {payslip.year}

// </Text>



// <View style={styles.employeeInfo}>


// <View style={styles.col}>


// <Row
// label="Employee Name"
// value={employeeDetails.employee_details.name}
// />

// <Row
// label="Employee ID"
// value={employeeDetails.employee_id}
// />

// <Row
// label="Designation"
// value={employeeDetails.official_details.designation}
// />

// <Row
// label="Joining Date"
// value={new Date(employeeDetails.joining_date).toLocaleDateString()}
// />

// </View>


// <View style={styles.col}>


// <Row
// label="PF No"
// value={employeeDetails.account_details.pf_number}
// />

// <Row
// label="ESI No"
// value={employeeDetails.account_details.esi_number}
// />

// <Row
// label="Account No"
// value={employeeDetails.account_details.bank_details.account_number}
// />

// <Row
// label="Worked Days"
// value={payslip.payrollSummary.payableDays}
// />

// </View>


// </View>



// <View style={styles.tableHeader}>

// <Text style={styles.bold}>
// Earnings
// </Text>

// <Text style={styles.bold}>
// Deductions
// </Text>

// </View>



// {Array.from({length:maxLength})
// .map((_,i)=>{

// const e=earnings[i];
// const d=deductions[i];

// return(

// <View style={styles.row} key={i}>

// <Text>
// {e?e[0]:""}
// </Text>

// <Text>
// {e?e[1].toFixed(2):""}
// </Text>

// <Text>
// {d?d[0]:""}
// </Text>

// <Text>
// {d?d[1].toFixed(2):""}
// </Text>

// </View>

// )

// })}



// <View style={styles.row}>

// <Text>
// Total Earnings
// </Text>

// <Text>
// {payslip.grossEarnings.toFixed(2)}
// </Text>

// <Text>
// Total Deductions
// </Text>

// <Text>
// {payslip.grossDeductions.toFixed(2)}
// </Text>

// </View>



// <Text style={styles.net}>

// Net Pay ₹
// {payslip.netPay.toFixed(2)}

// </Text>


// <Text>

// Amount in Words

// {netWords}

// </Text>



// </View>

// </ViewShot>

// </ScrollView>

// )

// }


// const Row=({label,value})=>(

// <View style={styles.empRow}>

// <Text>
// {label}
// </Text>

// <Text>
// {value}
// </Text>

// </View>

// )


// export default PayslipTemplate;


// const styles=StyleSheet.create({

// template:{
// backgroundColor:"#eef8ee",
// width:350,
// padding:10
// },

// header:{
// alignItems:"center",
// borderBottomWidth:2
// },

// logo:{
// position:"absolute",
// left:5,
// width:70,
// height:70,
// resizeMode:"contain"
// },

// company:{
// fontSize:18,
// fontWeight:"bold"
// },

// title:{
// textAlign:"center",
// marginVertical:10,
// fontWeight:"bold"
// },

// employeeInfo:{
// flexDirection:"row",
// justifyContent:"space-between"
// },

// col:{
// width:"48%"
// },

// empRow:{
// flexDirection:"row",
// justifyContent:"space-between",
// marginBottom:4
// },

// tableHeader:{
// flexDirection:"row",
// justifyContent:"space-around",
// marginTop:10
// },

// row:{
// flexDirection:"row",
// justifyContent:"space-between",
// borderBottomWidth:1,
// padding:2
// },

// bold:{
// fontWeight:"bold"
// },

// net:{
// marginTop:10,
// fontWeight:"bold"
// }

// });
import React,{useRef,useState} from "react";
import {
View,
Text,
StyleSheet,
Image,
ScrollView,
TouchableOpacity,
Alert
} from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
 import RNHTMLtoPDF from "react-native-html-to-pdf";
 import { PDFDocument, Page } from "react-native-pdf-lib";
 import RNPrint from 'react-native-print';

// import companyLogo from "../Company Logos/logo.png";
import {ToWords} from "to-words";
import companyLogo from "../../android/app/src/main/assets/1.png";
import LinearGradient from 'react-native-linear-gradient';
import companyLogoBase64 from "../../android/app/src/main/assets/1.png";
const MONTH_MAP={
1:"January",
2:"February",
3:"March",
4:"April",
5:"May",
6:"June",
7:"July",
8:"August",
9:"September",
10:"October",
11:"November",
12:"December"
};

const PayslipTemplateNative=({payslipResponse})=>{

const viewRef=useRef();

const {companyDetails,employeeDetails,payslips}=payslipResponse;

const payslip=payslips[0];

const earnings=payslip.salaryDetails
.filter(x=>x.type==="Earning");

const deductions=payslip.salaryDetails
.filter(x=>x.type==="Deduction");

const toWords=new ToWords({localeCode:"en-IN"});

const words = toWords.convert(Math.floor(payslip.netPay));

// const downloadPDF = async () => {

// try{

// const uri = await viewRef.current.capture();

// const file = await RNHTMLtoPDF.convert({

// html:`<img src="${uri}" style="width:100%;"/>`,

// fileName:"Payslip",

// directory:"Download"

// });

// alert("Saved at:\n" + file.filePath);

// }catch(e){

// console.log(e);

// alert("Download Failed");

// }

// };


// 


// const downloadPDF = async () => {

// try {

// const uri = await viewRef.current.capture({
// format: "png",
// quality: 1
// });

// // A4 Size

// const pageWidth = 595;
// const pageHeight = 842;

// // Save path

// const pdfPath =
// RNFS.DownloadDirectoryPath +
// `/Payslip_${Date.now()}.pdf`;

// // Create PDF

// const pdf = PDFDocument.create(pdfPath)
// .addPages(
// Page.create()
// .setMediaBox(pageWidth, pageHeight)
// .drawImage(uri, "png", {
// x: 0,
// y: 0,
// width: pageWidth,
// height: pageHeight
// })
// );

// await pdf.write();

// alert("PDF Saved:\n" + pdfPath);

// // Share PDF

// await Share.open({
// url: "file://" + pdfPath,
// type: "application/pdf"
// });

// } catch (e) {

// console.log("PDF Error:", e);

// }

// };


// const downloadPDF = async () => {
//   try {
//     const { companyDetails, employeeDetails, payslips } = payslipResponse;
//     const payslip = payslips[0];

//     const toWords = new ToWords({ localeCode: "en-IN" });
//     const words = toWords.convert(Math.floor(payslip.netPay));

//     let rows = "";

//     const earnings = payslip.salaryDetails.filter(x => x.type === "Earning");
//     const deductions = payslip.salaryDetails.filter(x => x.type === "Deduction");
//     const maxLength = Math.max(earnings.length, deductions.length);

//     for (let i = 0; i < maxLength; i++) {
//       const e = earnings[i];
//       const d = deductions[i];

//       rows += `
//         <tr>
//           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${e?.name || ""}</td>
//           <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${e ? e.calculatedAmount.toFixed(2) : ""}</td>
//           <td style="padding: 8px; border-bottom: 1px solid #ddd;">${d?.name || ""}</td>
//           <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${d ? d.calculatedAmount.toFixed(2) : ""}</td>
//         </tr>
//       `;
//     }

//     const fileName = `Payslip_${employeeDetails.employee_id}_${MONTH_MAP[payslip.month]}_${payslip.year}`;

//     const html = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <style>
//     * {
//       margin: 0;
//       padding: 0;
//       box-sizing: border-box;
//     }

//     body {
//       font-family: 'Calibri', 'Arial', sans-serif;
//       background-color: #f5f5f5;
//       padding: 0;
//     }

//     @page {
//       size: A4;
//       margin: 0;
//     }

//     .page {
//       width: 210mm;
//       height: 297mm;
//       padding: 15mm;
//       background: white;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//       margin: 10mm auto;
//       color: #333;
//     }

//     .header {
//       text-align: center;
//       border-bottom: 2px solid #333;
//       padding-bottom: 12px;
//       margin-bottom: 15px;
//     }

//     .company-name {
//       font-size: 18px;
//       font-weight: bold;
//       color: #1a1a1a;
//       margin: 10px 0;
//     }

//     .title {
//       text-align: center;
//       font-size: 16px;
//       font-weight: bold;
//       margin: 15px 0;
//     }

//     .section {
//       margin-bottom: 15px;
//     }

//     .employee-info {
//       display: grid;
//       grid-template-columns: 1fr 1fr;
//       gap: 20px;
//       margin-bottom: 20px;
//       font-size: 11px;
//     }

//     .info-row {
//       display: flex;
//       justify-content: space-between;
//       margin-bottom: 6px;
//       line-height: 1.5;
//     }

//     .info-label {
//       font-weight: bold;
//       width: 40%;
//     }

//     .info-value {
//       width: 60%;
//       text-align: left;
//     }

//     .salary-table {
//       width: 100%;
//       border-collapse: collapse;
//       margin: 15px 0;
//       border: 1px solid #999;
//       font-size: 11px;
//     }

//     .salary-table th {
//       background-color: #e8e8e8;
//       padding: 8px;
//       text-align: left;
//       font-weight: bold;
//       border: 1px solid #999;
//     }

//     .salary-table td {
//       padding: 8px;
//       border: 1px solid #ddd;
//     }

//     .salary-table .amount {
//       text-align: right;
//       width: 15%;
//     }

//     .salary-table .particular {
//       width: 35%;
//     }

//     .totals-row {
//       background-color: #f0f0f0;
//       font-weight: bold;
//     }

//     .net-pay {
//       font-size: 13px;
//       font-weight: bold;
//       margin-top: 15px;
//       margin-bottom: 8px;
//     }

//     .words {
//       font-size: 11px;
//       margin-bottom: 15px;
//       line-height: 1.6;
//     }

//     .note {
//       text-align: center;
//       font-size: 9px;
//       color: #666;
//       margin-top: 20px;
//       padding-top: 10px;
//       border-top: 1px solid #ddd;
//     }

//     @media print {
//       body {
//         background: white;
//       }
//       .page {
//         box-shadow: none;
//         margin: 0;
//         padding: 15mm;
//       }
//     }
//   </style>
// </head>
// <body>
//   <div class="page">
//     <!-- Header -->
//     <div class="header">
//       <div class="company-name">${companyDetails.name}</div>
//     </div>

//     <!-- Title -->
//     <div class="title">
//       Pay Slip - ${MONTH_MAP[payslip.month]} ${payslip.year}
//     </div>

//     <!-- Employee Information -->
//     <div class="employee-info">
//       <div>
//         <div class="info-row">
//           <span class="info-label">Employee Name:</span>
//           <span class="info-value">${employeeDetails.employee_details.name}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">Employee ID:</span>
//           <span class="info-value">${employeeDetails.employee_id}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">Designation:</span>
//           <span class="info-value">${employeeDetails.official_details.designation}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">Date of Joining:</span>
//           <span class="info-value">${new Date(employeeDetails.joining_date).toLocaleDateString()}</span>
//         </div>
//       </div>
//       <div>
//         <div class="info-row">
//           <span class="info-label">PF No:</span>
//           <span class="info-value">${employeeDetails.account_details.pf_number}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">ESI No:</span>
//           <span class="info-value">${employeeDetails.account_details.esi_number}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">Account No:</span>
//           <span class="info-value">${employeeDetails.account_details.bank_details.account_number}</span>
//         </div>
//         <div class="info-row">
//           <span class="info-label">Worked Days:</span>
//           <span class="info-value">${payslip.payrollSummary.payableDays}</span>
//         </div>
//       </div>
//     </div>

//     <!-- Salary Table -->
//     <table class="salary-table">
//       <thead>
//         <tr>
//           <th colspan="2">Earnings</th>
//           <th colspan="2">Deductions</th>
//         </tr>
//         <tr>
//           <th class="particular">Particulars</th>
//           <th class="amount">Amount (₹)</th>
//           <th class="particular">Particulars</th>
//           <th class="amount">Amount (₹)</th>
//         </tr>
//       </thead>
//       <tbody>
//         ${rows}
//         <tr class="totals-row">
//           <td class="particular">Total Earnings</td>
//           <td class="amount">${payslip.grossEarnings.toFixed(2)}</td>
//           <td class="particular">Total Deductions</td>
//           <td class="amount">${payslip.grossDeductions.toFixed(2)}</td>
//         </tr>
//       </tbody>
//     </table>

//     <!-- Net Pay -->
//     <div class="net-pay">
//       Net Pay: ₹${payslip.netPay.toFixed(2)}
//     </div>

//     <!-- Amount in Words -->
//     <div class="words">
//       <strong>Amount in Words:</strong> ${words} Only
//     </div>

//     <!-- Note -->
//     <div class="note">
//       This payslip is computer generated and does not require a signature.
//     </div>
//   </div>
// </body>
// </html>
//     `;

//     const pdfPath = await RNHTMLtoPDF.convert({
//       html,
//       fileName: fileName,
//       directory: "Documents",
//       base64: false,
//     });

//     Alert.alert(
//       "Success",
//       `PDF downloaded successfully!\n\nFile: ${fileName}.pdf`,
//       [{ text: "OK" }]
//     );

//     // Share the PDF
//     await Share.open({
//       url: "file://" + pdfPath.filePath,
//       type: "application/pdf",
//       filename: fileName + ".pdf",
//     });

//   } catch (error) {
//     console.log("Download Error:", error);
//     Alert.alert(
//       "Error",
//       "Failed to download payslip PDF. Please try again."
//     );
//   }
// }




const downloadPDF = async () => {

try {

const { companyDetails, employeeDetails, payslips} =
payslipResponse;

const payslip = payslips[0];

const toWords = new ToWords({
localeCode: "en-IN",
converterOptions: {
currency: true,
ignoreDecimal: false,
ignoreZeroCurrency: false,
}
});
const logoBase64 = await RNFS.readFileAssets(
  '1.png',
  'base64'
);
console.log("LOGO LENGTH:", logoBase64?.length);
const netPayWords =
toWords.convert(payslip.netPay);

const earnings =
payslip.salaryDetails.filter(
x => x.type === "Earning"
);

const deductions =
payslip.salaryDetails.filter(
x => x.type === "Deduction"
);

const maxLength =
Math.max(earnings.length, deductions.length);

let rows = "";

for (let i = 0; i < maxLength; i++) {

const e = earnings[i];
const d = deductions[i];

rows += `
<div class="table-row">
<div class="col">${e?.name || ""}</div>
<div class="amount">${e ? e.calculatedAmount.toFixed(2) : ""}</div>
<div class="col">${d?.name || ""}</div>
<div class="amount">${d ? d.calculatedAmount.toFixed(2) : ""}</div>
</div>
`;

}

const html = `

<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>

body {
  font-family: Arial, sans-serif;
  margin: auto;
  padding: 0;
}

.payslip-template{
font-family:"Poppins", "sans-serif";
width: 94%;
margin: 0;
padding: 20px 25px;
background: linear-gradient(
to top,
rgba(193, 223, 196, 0) 0%,
rgba(238, 248, 238, 0.9647) 100%
);
}

.payslip-header{
position:relative;
text-align:center;
padding:20px 0;
border-bottom:2px solid black;
}

.company-logo{
height:auto;
left:20px;
top:10px;
width:80px;
}

.payslip-title{
text-align:center;
font-size:16px;
margin:10px 0;
text-decoration:underline;
color: #004c3f;
}

.employee-info{
display:flex;
justify-content:space-between;
font-size:12px;
margin-bottom:10px;
}

.employee-col{
width:48%;
}
.employee-value{
  text-align: right;
  font-weight: bold;
}
.employee-row{
display:flex;
justify-content:space-between;
margin-bottom:4px;
}

.salary-table{
margin-top:20px;
border:1px solid black;
font-size:12px;
}

.table-header{
display:grid;
grid-template-columns:2fr 1fr 2fr 1fr;
background:#f2f2f2;
font-weight:bold;
padding:8px 0;
border-bottom: 1px solid #000;
}
.table-header-cat-ps{
   display: grid;
  grid-template-columns: 2fr 2fr ;
   background-color: #f2f2f2;
  font-weight: bold;
  
}
.col-cat-ps{
justify-content: center;
align-items: center;
text-align:center;
border: 1px solid black;
}
.table-row{
display:grid;
grid-template-columns:2fr 1fr 2fr 1fr;
padding:4px 0;
}

.table-total{
display:grid;
grid-template-columns:2fr 1fr 2fr 1fr;
border-top:1px solid black;
font-weight:bold;
padding:6px 0;
}

.col{
padding:2px 12px;
}

.amount{
text-align:right;
padding:2px 12px;
font-weight:bold;
}

.footer{
margin-top:15px;
font-size:12px;
}

.note{
text-align:center;
margin-top:15px;
color:#444;
}

</style>
</head>

<body>
<div class="payslip-template">
<table width="100%" style="border-bottom:2px solid black;padding-bottom:10px;">
  <tr>
    <td width="20%" align="left">
      <img 
        src="data:image/png;base64,${logoBase64}" 
        style="width:80px;height:auto;" 
      />
    </td>

    <td width="60%" align="center">
      <h2 style="margin:0;">${companyDetails.name}</h2>
    </td>

    <td width="20%"></td>
  </tr>
</table>


<h3 class="payslip-title">
Pay Slip - ${MONTH_MAP[payslip.month]} ${payslip.year}
</h3>

<div class="employee-info">

<div class="employee-col">

<div class="employee-row">
<span>Employee Name</span>
<span class="employee-value">${employeeDetails.employee_details.name}</span>
</div>

<div class="employee-row">
<span>Employee ID</span>
<span class="employee-value">${employeeDetails.employee_id}</span>
</div>

<div class="employee-row">
<span>Designation</span>
<span class="employee-value">${employeeDetails.official_details.designation}</span>
</div>

<div class="employee-row">
<span>Date of Joining</span>
<span class="employee-value">${new Date(employeeDetails.joining_date).toLocaleDateString()}</span>
</div>

</div>

<div class="employee-col">

<div class="employee-row">
<span>PF No</span>
<span class="employee-value">${employeeDetails.account_details.pf_number}</span>
</div>

<div class="employee-row">
<span>ESI No</span>
<span class="employee-value">${employeeDetails.account_details.esi_number}</span>
</div>

<div class="employee-row">
<span>Account No</span>
<span class="employee-value">${employeeDetails.account_details.bank_details.account_number}</span>
</div>

<div class="employee-row">
<span>Worked Days</span>
<span class="employee-value">${payslip.payrollSummary.payableDays}</span>
</div>

</div>

</div>

<div class="salary-table">
<div class="table-header-cat-ps">
            <div class="col-cat-ps">Earnings</div>
            <div class="col-cat-ps">Deductions</div>
          </div>
<div class="table-header">
<div class="col">Particulars</div>
<div class="amount">Amount (₹)</div>
<div class="col">Particulars</div>
<div class="amount">Amount (₹)</div>
</div>

${rows}

<div class="table-total">
<div class="col">Total Earnings</div>
<div class="amount">${payslip.grossEarnings.toFixed(2)}</div>
<div class="col">Total Deductions</div>
<div class="amount">${payslip.grossDeductions.toFixed(2)}</div>
</div>

</div>

<div class="footer">
<p>Net Pay: <b>₹${payslip.netPay.toFixed(2)}</b></p>
<p>Amount in Words: <b>${netPayWords}</b></p>
<p class="note">
Note: This payslip is computer generated and does not require a signature.
</p>
</div>
</div>


</body>
</html>
`;

await RNPrint.print({
html,
margins:{
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

} catch (error) {
console.log("PDF Error:", error);
}

};


return(

<ScrollView contentContainerStyle={{paddingBottom:80}}>

<ViewShot ref={viewRef}>

<LinearGradient
  colors={[
    "rgba(193,223,196,0)",
    "rgba(238,248,238,0.9647)"
  ]}
 end={{ x: 0.5, y: 1 }}   // bottom
  start={{ x: 0.5, y: 0 }}     // top
  style={styles.page}
>
  {/* Your Payslip Content Here */}


{/* HEADER */}

<View style={styles.header}>

<Image
source={companyLogo}
style={styles.logo}
/>

<Text style={styles.company}>
{companyDetails.name}
</Text>

</View>


<View style={styles.line}/>


<Text style={styles.title}>

Pay Slip - {MONTH_MAP[payslip.month]} {payslip.year}

</Text>



{/* EMPLOYEE INFO */}

<View style={styles.infoRow}>


<View style={styles.col}>

<Row label="Employee Name" style={styles.defaultText}
value={employeeDetails.employee_details.name}/>

<Row label="Employee ID"
value={employeeDetails.employee_id}/>

<Row label="Designation"
value={employeeDetails.official_details.designation}/>

<Row label="Date of Joining"
value={new Date(employeeDetails.joining_date).toLocaleDateString()}/>

</View>

<View style={styles.col}>

<Row label="PF No"
value={employeeDetails.account_details.pf_number}/>

<Row label="ESI No"
value={employeeDetails.account_details.esi_number}/>

<Row label="Account No"
value={employeeDetails.account_details.bank_details.account_number}/>

<Row label="Worked Days"
value={payslip.payrollSummary.payableDays}/>

</View>


</View>



{/* TABLE */}

<View style={styles.table}>


<View style={styles.tableHeader}>

<Text style={styles.headerText}>
Earnings
</Text>

<Text style={styles.headerText}>
Deductions
</Text>

</View>



<View style={styles.tableSubHeader}>

<Text style={styles.col1}>Particulars</Text>
<Text style={styles.col2}>Amount</Text>

<Text style={styles.col3}>Particulars</Text>
<Text style={styles.col4}>Amount</Text>

</View>



{Array.from({
length:Math.max(
earnings.length,
deductions.length)
}).map((_,i)=>{

const e=earnings[i];
const d=deductions[i];

return(

<View style={styles.tableRow} key={i}>

<Text style={styles.col1}>{e?.name}</Text>

<Text style={styles.col2}>{e?.calculatedAmount?.toFixed(2)}</Text>

<Text style={styles.col3}>{d?.name}</Text>

<Text style={styles.col4}>{d?.calculatedAmount?.toFixed(2)}</Text>

</View>

)

})}



<View style={styles.totalRow}>

<Text style={styles.col1}>Total Earnings</Text>

<Text style={styles.col2}>
{payslip.grossEarnings.toFixed(2)}
</Text>

<Text style={styles.col3}>Total Deductions</Text>

<Text style={styles.col4}>
{payslip.grossDeductions.toFixed(2)}
</Text>

</View>


</View>



<Text style={styles.netPay}>

Net Pay: ₹{payslip.netPay.toFixed(2)}

</Text>



<Text style={styles.words}>
    Amount in Words:
{words} Only
</Text>



<Text style={styles.note}>

Note: This payslip is computer generated and does not require a signature.

</Text>



</LinearGradient>

</ViewShot>



{/* DOWNLOAD BUTTON */}

<TouchableOpacity
style={styles.downloadBtn}
onPress={downloadPDF}
>

<Text style={{color:"#f3f0f0"}}>
Download PDF
</Text>

</TouchableOpacity>


</ScrollView>

)

}

const Row=({label,value,labelStyle,valueStyle})=>(

<View style={styles.row}>

<Text style={[styles.defaultText, labelStyle]}>{label}</Text>

<Text style={[styles.defaultvalText, valueStyle]}>{value}</Text>

</View>

);

export default PayslipTemplateNative;

const styles = StyleSheet.create({
defaultText:{
color:"#000",
fontSize:10
},
defaultvalText:{
color:"#000",
fontSize:10,
fontWeight:"500"
},

page:{
backgroundColor:"#e2f0e2",
margin:10,
padding:15,
borderRadius:6,
color:"#170a0a",
},

header:{
alignItems:"center",
color:"#170a0a",
},

logo:{
position:"absolute",
left:0,
width:80,
height:35,
resizeMode:"contain"
},

company:{
fontSize:20,
fontWeight:"bold",
color:"#000"
},

line:{
borderBottomWidth:2,
marginVertical:10,
color:"#000"
},

title:{
textAlign:"center",
fontSize:16,
fontWeight:"bold",
marginBottom:15,
color: "#004c3f",

},

infoRow:{
flexDirection:"row",
justifyContent:"space-between",
color:"#000",
fontWeight:"500"
},

col:{
width:"48%",
color: "#000",
},
col1:{
flex:2,
fontSize:10,
color:"#000"
},

col2:{
flex:1,
textAlign:"right",
fontSize:10,
color:"#000",
fontWeight:"500"
},

col3:{
flex:2,
fontSize:10,
marginLeft:12,
color:"#000"
},

col4:{
flex:1,
textAlign:"right",
fontSize:10,
color:"#000",
fontWeight:"500"
},

row:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:6,
color:"#000"
},

table:{
borderWidth:1,
marginTop:15,
color:"#000"
},

tableHeader:{
flexDirection:"row",
justifyContent:"space-around",
borderBottomWidth:1,
padding:5,
backgroundColor:"#f2f2f2",
},

headerText:{
fontWeight:"bold",
color:"#000"
},

tableSubHeader:{
flexDirection:"row",
justifyContent:"space-between",
padding:5,
borderBottomWidth:1,
color:"#000",
backgroundColor:"#f2f2f2",
underlineColorAndroid:"#000"
},

tableRow:{
flexDirection:"row",
justifyContent:"space-between",
padding:2.5,
color:"#000"
},

totalRow:{
flexDirection:"row",
justifyContent:"space-between",
borderTopWidth:1,
padding:6,
fontWeight:"bold",
color:"#000"
},

netPay:{
marginTop:15,
fontSize:12,
fontWeight:"bold",
color:"#000"
},

words:{
marginTop:4,
color:"#000",
fontSize:11
},

note:{
marginTop:10,
textAlign:"center",
color:"#555",
fontSize:7
},

downloadBtn:{
backgroundColor:"#6a9689",
margin:15,
padding:15,
borderRadius:8,
alignItems:"center",
color:"#000"
}

 });
// import React from "react";
// import {
// View,
// Text,
// TouchableOpacity,
// StyleSheet
// } from "react-native";

// import RNHTMLtoPDF from "react-native-html-to-pdf";
// import { ToWords } from "to-words";



// const MONTH_MAP = {
// 1:"January",
// 2:"February",
// 3:"March",
// 4:"April",
// 5:"May",
// 6:"June",
// 7:"July",
// 8:"August",
// 9:"September",
// 10:"October",
// 11:"November",
// 12:"December"
// };

// const PayslipTemplate = ({ payslipResponse }) => {

// if(!payslipResponse) return null;

// const { companyDetails, employeeDetails, payslips }
// = payslipResponse;

// const payslip = payslips[0];

// const earnings = payslip.salaryDetails
// .filter(x=>x.type==="Earning");

// const deductions = payslip.salaryDetails
// .filter(x=>x.type==="Deduction");

// const toWords = new ToWords({
// localeCode:"en-IN"
// });

// const words = toWords.convert(payslip.netPay);



// const generateHTML = ()=>{

// let rows="";

// const maxLength=Math.max(
// earnings.length,
// deductions.length
// );

// for(let i=0;i<maxLength;i++){

// rows+=`

// <div class="table-row-ps">

// <div class="col-ps">
// ${earnings[i]?.name||""}
// </div>

// <div class="amount">
// ${earnings[i]?.calculatedAmount?.toFixed(2)||""}
// </div>

// <div class="col-ps">
// ${deductions[i]?.name||""}
// </div>

// <div class="amount">
// ${deductions[i]?.calculatedAmount?.toFixed(2)||""}
// </div>

// </div>

// `;

// }


// return `

// <html>

// <style>

// body{
// font-family:Calibri;
// padding:20px;
// }

// .payslip-template{
// background:linear-gradient(
// to top,
// rgba(193,223,196,0),
// rgba(238,248,238,0.96)
// );
// padding:20px;
// }

// .payslip-header{
// position:relative;
// text-align:center;
// border-bottom:2px solid black;
// padding:20px;
// }

// .company-logo{
// position:absolute;
// left:10px;
// top:5px;
// width:80px;
// }

// .employee-info{
// display:flex;
// justify-content:space-between;
// font-size:12px;
// margin-top:10px;
// }

// .employee-row{
// display:flex;
// justify-content:space-between;
// margin-bottom:4px;
// }

// .salary-table{
// border:1px solid black;
// margin-top:20px;
// }

// .table-header-cat-ps{
// display:grid;
// grid-template-columns:2fr 2fr;
// background:#f2f2f2;
// font-weight:bold;
// }

// .table-header-ps{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// background:#f2f2f2;
// border-bottom:1px solid black;
// }

// .table-row-ps{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// }

// .table-row-ps-last{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// border-top:1px solid black;
// font-weight:bold;
// }

// .amount{
// text-align:right;
// padding-right:10px;
// }

// .title{
// text-align:center;
// margin-top:10px;
// font-weight:bold;
// }

// .note{
// text-align:center;
// margin-top:15px;
// }

// </style>


// <body>

// <div class="payslip-template">

// <div class="payslip-header">

// <img
// src="${logoPath}"
// class="company-logo"
// />

// <h2>
// ${companyDetails.name}
// </h2>

// </div>


// <div class="title">

// PAYSLIP -
// ${MONTH_MAP[payslip.month]}
// ${payslip.year}

// </div>



// <div class="employee-info">

// <div>

// <div class="employee-row">
// <span>Employee Name</span>
// <span>
// ${employeeDetails.employee_details.name}
// </span>
// </div>

// <div class="employee-row">
// <span>Employee ID</span>
// <span>
// ${employeeDetails.employee_id}
// </span>
// </div>

// <div class="employee-row">
// <span>Designation</span>
// <span>
// ${employeeDetails.official_details.designation}
// </span>
// </div>

// <div class="employee-row">
// <span>Date of Joining</span>
// <span>
// ${new Date(employeeDetails.joining_date).toLocaleDateString()}
// </span>
// </div>

// </div>


// <div>

// <div class="employee-row">
// <span>PF No</span>
// <span>
// ${employeeDetails.account_details.pf_number}
// </span>
// </div>

// <div class="employee-row">
// <span>ESI No</span>
// <span>
// ${employeeDetails.account_details.esi_number}
// </span>
// </div>

// <div class="employee-row">
// <span>Account No</span>
// <span>
// ${employeeDetails.account_details.bank_details.account_number}
// </span>
// </div>

// <div class="employee-row">
// <span>Worked Days</span>
// <span>
// ${payslip.payrollSummary.payableDays}
// </span>
// </div>

// </div>

// </div>



// <div class="salary-table">


// <div class="table-header-cat-ps">

// <div>Earnings</div>
// <div>Deductions</div>

// </div>


// <div class="table-header-ps">

// <div>Particulars</div>
// <div>Amount</div>

// <div>Particulars</div>
// <div>Amount</div>

// </div>


// ${rows}



// <div class="table-row-ps-last">

// <div>Total Earnings</div>

// <div>
// ${payslip.grossEarnings.toFixed(2)}
// </div>

// <div>Total Deductions</div>

// <div>
// ${payslip.grossDeductions.toFixed(2)}
// </div>

// </div>


// </div>


// <p>

// Net Pay ₹${payslip.netPay.toFixed(2)}

// </p>


// <p>

// Amount in Words:
// ${words}

// </p>


// <p class="note">

// This payslip is computer generated and does not require signature

// </p>


// </div>

// </body>

// </html>

// `;

// };



// const downloadPDF = async ()=>{

// const html=generateHTML();

// await RNHTMLtoPDF.convert({

// html,
// fileName:"Payslip",
// directory:"Documents"

// });

// };


// return(

// <View style={styles.container}>

// <TouchableOpacity
// style={styles.btn}
// onPress={downloadPDF}
// >

// <Text style={{color:"white"}}>

// Download Payslip PDF

// </Text>

// </TouchableOpacity>

// </View>

// );

// };

// export default PayslipTemplate;



// const styles=StyleSheet.create({

// container:{
// padding:20
// },

// btn:{
// backgroundColor:"#6a9689",
// padding:15,
// borderRadius:8,
// alignItems:"center"
// }

// });
// import React from "react";
// import { View, StyleSheet } from "react-native";
// import { WebView } from "react-native-webview";
// import { ToWords } from "to-words";

// const MONTH_MAP = {
//   1:"January",
//   2:"February",
//   3:"March",
//   4:"April",
//   5:"May",
//   6:"June",
//   7:"July",
//   8:"August",
//   9:"September",
//   10:"October",
//   11:"November",
//   12:"December"
// };

// const PayslipTemplate = ({ payslipResponse }) => {

// if(!payslipResponse) return null;

// const { companyDetails, employeeDetails, payslips } = payslipResponse;

// const payslip = payslips[0];

// const earnings = payslip.salaryDetails
// .filter(x=>x.type==="Earning");

// const deductions = payslip.salaryDetails
// .filter(x=>x.type==="Deduction");

// const maxLength=Math.max(
// earnings.length,
// deductions.length
// );

// const toWords=new ToWords({
// localeCode:"en-IN",
// converterOptions:{currency:true}
// });

// const words=toWords.convert(payslip.netPay);



// let rows="";

// for(let i=0;i<maxLength;i++){

// rows+=`

// <div class="table-row-ps">

// <div class="col-ps">
// ${earnings[i]?.name||""}
// </div>

// <div class="amount">
// ${earnings[i]?.calculatedAmount?.toFixed(2)||""}
// </div>

// <div class="col-ps">
// ${deductions[i]?.name||""}
// </div>

// <div class="amount">
// ${deductions[i]?.calculatedAmount?.toFixed(2)||""}
// </div>

// </div>

// `;

// }



// const html=`

// <html>

// <head>

// <meta name="viewport" content="width=device-width, initial-scale=1.0">

// <style>

// body{
// font-family:Calibri;
// background:#f8f9fa;
// padding:10px;
// }

// /* EXACT CSS COPY */

// .payslip-template{
// background:linear-gradient(
// to top,
// rgba(193,223,196,0),
// rgba(238,248,238,0.96)
// );
// width:700px;
// margin:auto;
// padding:20px;
// border-radius:8px;
// }

// .payslip-header{
// position:relative;
// text-align:center;
// border-bottom:2px solid black;
// padding:20px 0;
// }

// .company-logo{
// position:absolute;
// left:20px;
// top:7px;
// width:80px;
// }

// .employee-info{
// display:flex;
// justify-content:space-between;
// font-size:12px;
// }

// .employee-row{
// display:flex;
// justify-content:space-between;
// margin-bottom:4px;
// }

// .salary-table{
// border:1px solid black;
// margin-top:20px;
// font-size:12px;
// }

// .table-header-cat-ps{
// display:grid;
// grid-template-columns:2fr 2fr;
// background:#f2f2f2;
// font-weight:bold;
// }

// .table-header-ps{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// background:#f2f2f2;
// border-bottom:1px solid black;
// }

// .table-row-ps{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// }

// .table-row-ps-last{
// display:grid;
// grid-template-columns:2fr 1fr 2fr 1fr;
// border-top:1px solid black;
// font-weight:bold;
// }

// .amount{
// text-align:right;
// padding-right:10px;
// }

// .note{
// text-align:center;
// margin-top:15px;
// }

// </style>

// </head>

// <body>


// <div class="payslip-template">

// <div class="payslip-header">

// <img
// src="file:///android_asset/logo.png"
// class="company-logo"
// />

// <h2>

// ${companyDetails.name}

// </h2>

// </div>


// <h3 style="text-align:center">

// Pay Slip -
// ${MONTH_MAP[payslip.month]}
// ${payslip.year}

// </h3>



// <div class="employee-info">

// <div>

// <div class="employee-row">
// <span>Employee Name</span>
// <span>${employeeDetails.employee_details.name}</span>
// </div>

// <div class="employee-row">
// <span>Employee ID</span>
// <span>${employeeDetails.employee_id}</span>
// </div>

// <div class="employee-row">
// <span>Designation</span>
// <span>${employeeDetails.official_details.designation}</span>
// </div>

// </div>



// <div>

// <div class="employee-row">
// <span>PF No</span>
// <span>${employeeDetails.account_details.pf_number}</span>
// </div>

// <div class="employee-row">
// <span>Account No</span>
// <span>${employeeDetails.account_details.bank_details.account_number}</span>
// </div>

// <div class="employee-row">
// <span>Worked Days</span>
// <span>${payslip.payrollSummary.payableDays}</span>
// </div>

// </div>

// </div>



// <div class="salary-table">


// <div class="table-header-cat-ps">

// <div>Earnings</div>
// <div>Deductions</div>

// </div>


// <div class="table-header-ps">

// <div>Particulars</div>
// <div>Amount</div>

// <div>Particulars</div>
// <div>Amount</div>

// </div>


// ${rows}


// <div class="table-row-ps-last">

// <div>Total Earnings</div>

// <div>${payslip.grossEarnings.toFixed(2)}</div>

// <div>Total Deductions</div>

// <div>${payslip.grossDeductions.toFixed(2)}</div>

// </div>


// </div>


// <p>

// Net Pay ₹${payslip.netPay.toFixed(2)}

// </p>


// <p>

// Amount in Words:
// ${words}

// </p>


// <p class="note">

// This payslip is computer generated and does not require signature

// </p>


// </div>

// </body>

// </html>

// `;


// return(

// <View style={{flex:1}}>

// <WebView
// originWhitelist={['*']}
// source={{html}}
// style={{flex:1}}
// />

// </View>

// );

// };

// export default PayslipTemplate;
// import React from "react";
// import {
// View,
// Text,
// StyleSheet,
// Image,
// ScrollView
// } from "react-native";

// import companyLogo from "../../android/app/src/main/assets/1.png";


// const MONTH_MAP={
// 1:"January",
// 2:"February",
// 3:"March",
// 4:"April",
// 5:"May",
// 6:"June",
// 7:"July",
// 8:"August",
// 9:"September",
// 10:"October",
// 11:"November",
// 12:"December"
// };


// const PayslipTemplate=({payslipResponse})=>{

// if(!payslipResponse) return null;

// const {companyDetails,employeeDetails,payslips}
// =payslipResponse;

// const payslip=payslips[0];

// const earnings=payslip.salaryDetails
// .filter(x=>x.type==="Earning");

// const deductions=payslip.salaryDetails
// .filter(x=>x.type==="Deduction");

// const maxLength=Math.max(
// earnings.length,
// deductions.length
// );


// return(

// <ScrollView>

// <View style={styles.template}>


// <View style={styles.header}>

// <Image
// source={companyLogo}
// style={styles.logo}
// />

// <Text style={styles.company}>
// {companyDetails.name}
// </Text>

// </View>


// <Text style={styles.title}>

// Pay Slip -
// {MONTH_MAP[payslip.month]}
// {" "}
// {payslip.year}

// </Text>



// <View style={styles.employeeInfo}>


// <View style={styles.col}>


// <Row
// label="Employee Name"
// value={employeeDetails.employee_details.name}
// />

// <Row
// label="Employee ID"
// value={employeeDetails.employee_id}
// />

// <Row
// label="Designation"
// value={employeeDetails.official_details.designation}
// />

// <Row
// label="Joining Date"
// value={new Date(employeeDetails.joining_date).toLocaleDateString()}
// />

// </View>


// <View style={styles.col}>


// <Row
// label="PF No"
// value={employeeDetails.account_details.pf_number}
// />

// <Row
// label="ESI No"
// value={employeeDetails.account_details.esi_number}
// />

// <Row
// label="Account No"
// value={employeeDetails.account_details.bank_details.account_number}
// />

// <Row
// label="Worked Days"
// value={payslip.payrollSummary.payableDays}
// />

// </View>


// </View>



// <View style={styles.tableHeader}>

// <Text style={styles.bold}>
// Earnings
// </Text>

// <Text style={styles.bold}>
// Deductions
// </Text>

// </View>



// {Array.from({length:maxLength}).map((_,i)=>{

// const e=earnings[i];
// const d=deductions[i];

// return(

// <View style={styles.row} key={i}>

// <Text>
// {e?.name || ""}
// </Text>

// <Text>
// {e?.calculatedAmount?.toFixed(2) || ""}
// </Text>

// <Text>
// {d?.name || ""}
// </Text>

// <Text>
// {d?.calculatedAmount?.toFixed(2) || ""}
// </Text>

// </View>

// )

// })}



// <View style={styles.row}>

// <Text>Total Earnings</Text>

// <Text>
// {payslip.grossEarnings.toFixed(2)}
// </Text>

// <Text>Total Deduction</Text>

// <Text>
// {payslip.grossDeductions.toFixed(2)}
// </Text>

// </View>



// <Text style={styles.net}>

// Net Pay ₹
// {payslip.netPay.toFixed(2)}

// </Text>


// </View>

// </ScrollView>

// );

// };


// const Row=({label,value})=>(

// <View style={styles.empRow}>

// <Text>
// {label}
// </Text>

// <Text>
// {value}
// </Text>

// </View>

// );


// export default PayslipTemplate;



// const styles=StyleSheet.create({

// template:{
// width:350,
// backgroundColor:"#eef8ee",
// padding:10
// },

// header:{
// alignItems:"center",
// borderBottomWidth:2
// },

// logo:{
// position:"absolute",
// left:5,
// width:70,
// height:70
// },

// company:{
// fontSize:18,
// fontWeight:"bold"
// },

// title:{
// textAlign:"center",
// marginVertical:10,
// fontWeight:"bold"
// },

// employeeInfo:{
// flexDirection:"row",
// justifyContent:"space-between"
// },

// col:{
// width:"48%"
// },

// empRow:{
// flexDirection:"row",
// justifyContent:"space-between",
// marginBottom:3
// },

// tableHeader:{
// flexDirection:"row",
// justifyContent:"space-around",
// marginTop:10
// },

// row:{
// flexDirection:"row",
// justifyContent:"space-between",
// borderBottomWidth:1,
// padding:2
// },

// bold:{
// fontWeight:"bold"
// },

// net:{
// marginTop:10,
// fontWeight:"bold"
// }

// });