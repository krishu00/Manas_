import React, { useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
ActivityIndicator
} from "react-native";
import { apiMiddleware } from '../../src/apiMiddleware/apiMiddleware';
import Icon from "react-native-vector-icons/FontAwesome";
import {Picker} from "@react-native-picker/picker";
import axios from "axios";

import PayslipTemplate from "./PayslipTemplate";

const MyPayslip=()=>{

const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth() + 1;

const [year,setYear]=useState(currentYear);
const [month,setMonth]=useState(currentMonth);
const [payslipResponse,setPayslipResponse]=useState(null);
const [loading,setLoading]=useState(false); // spinner for fetch
const [searched,setSearched]=useState(false); // track if user pressed search
const yearList=[2024,2025,2026,2027];

const monthList=[
{value:1,label:"January"},
{value:2,label:"February"},
{value:3,label:"March"},
{value:4,label:"April"},
{value:5,label:"May"},
{value:6,label:"June"},
{value:7,label:"July"},
{value:8,label:"August"},
{value:9,label:"September"},
{value:10,label:"October"},
{value:11,label:"November"},
{value:12,label:"December"}
];
// const res=
// {
//   "success": true,
//   "count": 2,
//   "data": {
//     "companyDetails": {
//       "name": "Daksh Electronics"
//     },
//     "employeeDetails": {
//       "employee_details": {
//         "name": "Krishna Sharma"
//       },
//       "official_details": {
//         "designation": "J"
//       },
//       "account_details": {
//         "bank_details": {
//           "account_number": "65457686"
//         },
//         "esi_number": "789545412214",
//         "pf_number": "78954512122"
//       },
//       "_id": "68ee0b0da33469bab09b62c0",
//       "employee_id": "DE-0073",
//       "joining_date": "2025-04-25T12:26:34.972Z"
//     },
//     "payslips": [
//       {
//         "payrollSummary": {
//           "totalDays": 28,
//           "payableDays": 19
//         },
//         "_id": "699c4a1a27149de20aa93cca",
//         "company_id": "66a8e854617d72bf44379b79",
//         "employeeId": "DE-0073",
//         "month": 2,
//         "year": 2026,
//         "__v": 0,
//         "createdAt": "2026-02-23T12:37:46.320Z",
//         "employeeName": "Krishna Sharma",
//         "grossDeductions": 1851.14285714286,
//         "grossEarnings": 24765.4285714286,
//         "netPay": 22914.2857142857,
//         "processingDate": "2026-02-24T14:09:52.044Z",
//         "salaryDetails": [
//           {
//             "name": "Basic",
//             "type": "Earning",
//             "monthlyAmount": 22729,
//             "calculatedAmount": 15423.25,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1da"
//           },
//           {
//             "name": "Special Allowance",
//             "type": "Earning",
//             "monthlyAmount": 11999,
//             "calculatedAmount": 8142.17857142857,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1db"
//           },
//           {
//             "name": "Gross Salary",
//             "type": "Earning",
//             "monthlyAmount": 34728,
//             "calculatedAmount": 23565.4285714286,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1dc"
//           },
//           {
//             "name": "PF - Employee Contribution",
//             "type": "Deduction",
//             "monthlyAmount": 2728,
//             "calculatedAmount": 1851.14285714286,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1dd"
//           },
//           {
//             "name": "PF - Employer Contribution",
//             "type": "Statutory Component",
//             "monthlyAmount": 2728,
//             "calculatedAmount": 1851.14285714286,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1de"
//           },
//           {
//             "name": "Gratuity",
//             "type": "Statutory Component",
//             "monthlyAmount": 1093,
//             "calculatedAmount": 741.678571428571,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1df"
//           },
//           {
//             "name": "Insurance",
//             "type": "Statutory Component",
//             "monthlyAmount": 1200,
//             "calculatedAmount": 814.285714285714,
//             "isAdjustment": false,
//             "_id": "699db1304c2957e4f861b1e0"
//           },
//           {
//             "name": "xw",
//             "type": "Earning",
//             "monthlyAmount": 1200,
//             "calculatedAmount": 1200,
//             "isAdjustment": true,
//             "_id": "699db1304c2957e4f861b1e1"
//           }
//         ],
//         "updatedAt": "2026-02-24T14:09:52.047Z"
//       },
//       {
//         "payrollSummary": {
//           "totalDays": 31,
//           "payableDays": 26
//         },
//         "_id": "699db20527149de20aaba4a7",
//         "company_id": "66a8e854617d72bf44379b79",
//         "employeeId": "DE-0073",
//         "month": 1,
//         "year": 2026,
//         "__v": 0,
//         "createdAt": "2026-02-24T14:13:25.234Z",
//         "employeeName": "Krishna Sharma",
//         "grossDeductions": 3088,
//         "grossEarnings": 31126.7096774194,
//         "netPay": 28038.7096774194,
//         "processingDate": "2026-02-24T14:14:08.789Z",
//         "salaryDetails": [
//           {
//             "name": "Basic",
//             "type": "Earning",
//             "monthlyAmount": 22729,
//             "calculatedAmount": 19063.0322580645,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b499"
//           },
//           {
//             "name": "Special Allowance",
//             "type": "Earning",
//             "monthlyAmount": 11999,
//             "calculatedAmount": 10063.6774193548,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49a"
//           },
//           {
//             "name": "Gross Salary",
//             "type": "Earning",
//             "monthlyAmount": 34728,
//             "calculatedAmount": 29126.7096774194,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49b"
//           },
//           {
//             "name": "PF - Employee Contribution",
//             "type": "Deduction",
//             "monthlyAmount": 2728,
//             "calculatedAmount": 2288,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49c"
//           },
//           {
//             "name": "PF - Employer Contribution",
//             "type": "Statutory Component",
//             "monthlyAmount": 2728,
//             "calculatedAmount": 2288,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49d"
//           },
//           {
//             "name": "Gratuity",
//             "type": "Statutory Component",
//             "monthlyAmount": 1093,
//             "calculatedAmount": 916.709677419355,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49e"
//           },
//           {
//             "name": "Insurance",
//             "type": "Statutory Component",
//             "monthlyAmount": 1200,
//             "calculatedAmount": 1006.45161290323,
//             "isAdjustment": false,
//             "_id": "699db2304c2957e4f861b49f"
//           },
//           {
//             "name": "xw",
//             "type": "Earning",
//             "monthlyAmount": 500,
//             "calculatedAmount": 500,
//             "isAdjustment": true,
//             "_id": "699db2304c2957e4f861b4a0"
//           },
//           {
//             "name": "hhh",
//             "type": "Deduction",
//             "monthlyAmount": 800,
//             "calculatedAmount": 800,
//             "isAdjustment": true,
//             "_id": "699db2304c2957e4f861b4a1"
//           },
//           {
//             "name": "Bonus_ESIC",
//             "type": "Earning",
//             "monthlyAmount": 1500,
//             "calculatedAmount": 1500,
//             "isAdjustment": true,
//             "_id": "699db2304c2957e4f861b4a2"
//           }
//         ],
//         "updatedAt": "2026-02-24T14:14:08.789Z"
//       }
//     ]
//   }
// }
// const response = axios.get(
//   `${API_URL}/payslip/my_payslips`,
//   {
//     params: {
//       month,
//       year
//     }
//   }
// )

// const fetchPayslip= async()=>{
//   const response = await axios.get(
//   `${API_URL}/payslip/my_payslips`,
//   {
//     params: {
//       month,
//       year
//     }
//   }
// )
//    setPayslipResponse(response.data.data);
//  //setPayslipResponse(response.data.data);
// console.log("Pr",payslipResponse);
// };
 const fetchPayslip= async()=>{
 if (!year || !month) {
      alert("Please enter Year and Month");
      return;
    }

    try {
      setSearched(true);
      setLoading(true);

      const res =  await apiMiddleware.get(`/payslip/my_payslips`, {
          params: { year, month },
          
        }
      );

      if (res.data.success && res.data.count > 0) {
        setPayslipResponse(res.data.data);
      } else {
        setPayslipResponse(null);
      }
    } catch (err) {
      console.error(err);
      setPayslipResponse(null);
    } finally {
      setLoading(false);
    }
  };
return(

<View style={styles.container}>

<Text style={styles.title}>
My Payslip
</Text>

{/* FILTER ROW LIKE TRIPSCREEN */}

<View style={styles.filterRow}>


<View style={styles.dateBox}>
<Text style={styles.pickerText}>{year}</Text>
<Picker
selectedValue={year}
onValueChange={setYear}
style={{flex:1}}
itemStyle={{color:"#000", fontSize:14}}
>

{yearList.map(y=>(

<Picker.Item
key={y}
label={y.toString()}
value={y}
/>

))}

</Picker>
</View>

<View style={styles.dateBox}>
<Text style={styles.pickerText}>{monthList.find(m=>m.value===month)?.label || "Month"}</Text>
<Picker
selectedValue={month}
onValueChange={setMonth}
style={{flex:1}}
itemStyle={{color:"#000", fontSize:14}}
>

{monthList.map(m=>(

<Picker.Item
key={m.value}
label={m.label}
value={m.value}
/>
))}

</Picker>

</View>


<TouchableOpacity
style={styles.filterBtn}
onPress={fetchPayslip}
>

<Icon
name="search"
size={18}
color="#fff"
/>

</TouchableOpacity>

</View>

{/* PAYSLIP BELOW */}

<View style={styles.payslipArea}>
  {loading ? (
    <ActivityIndicator size="large" color="#6a9689" />
  ) : payslipResponse ? (
    <PayslipTemplate payslipResponse={payslipResponse} />
  ) : searched ? (
    <Text style={styles.noDataText}>No Payslip found</Text>
  ) : null}
</View>


</View>

)

}

export default MyPayslip;

const styles=StyleSheet.create({

container:{
flex:1,
backgroundColor:"#ffffff",
padding:11
},

title:{
fontSize:20,
fontWeight:"bold",
color:"#6a9689",
marginBottom:12,
paddingHorizontal: 135,
},

filterRow:{
flexDirection:"row",
justifyContent:"space-between",
height:"7%"
},

dateBox:{
flexDirection:"row",
alignItems:"center",
justifyContent:"center",
width:"42%",
borderWidth:1,
borderColor:"#dcdcdc",
borderRadius:8,
paddingHorizontal:6,
color:"#000"
},

filterBtn:{
backgroundColor:"#6a9689",
padding:12,
borderRadius:8,
marginLeft:2,
justifyContent:"center"
},

pickerText:{
fontSize:14,
fontWeight:"600",
color:"#000",
marginRight:2
},

payslipArea:{
marginTop:15,
alignItems:"center"
},

noDataText:{
  fontSize:16,
  color:"#555",
  marginTop:20
}

});