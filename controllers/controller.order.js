const express = require("express");
const router = express.Router();

router.get("/report", async (request, response)=>{
    let obj = [
        {
            "address" : "Agronic Food Private Limited8 Bhagat Ki Kothi Ext., Opp. New Campus, Pali Road, Jodhpur, Rajasthan – 342001, INDIA",
            "reportCode" : "TR-21-EKA2-012002-01",
            "reportDate" : "2021-08-31",
            "ulrNo" : "TC910821000009601F",
            "sampleReport" : {
                "sampleCode" : "EKA2-2021-08-000984",
                "sampleName" : "Organic Ginger Powder",
                "sampleAppearance" : "Light brown colour powder",
                "sampleQuantity" : "486 g",
                "conditionOnReceipt" : "Good",
                "samplePacking" : "Sealed polythene pack",
                "environmentalConditionDuringSampling" : "NA",
                "customerProvidedDetails" : "AF-ML-GINP/03/21",
                "sampleReceiptDate": "2021-08-27",
                "analysedStateDate" : "2021-08-27",
                "analysedEndDate" : "2021-08-31",
                "SamplingDetails" : "Not Sampled by Eureka",
                "sampleSealNumber" : "Not applicable",
                "samplingProcedure" : "Not applicable",
                "samplingDate": "Not applicable",
                "samplingLocation": "Not applicable",
                "jobFileNumber": "Not applicable"
            },
            "authorisedContact" : {
                "name" : "Mr. Satya Prakash",
                "designation" : "Team Lead- Chemical"
            },
            "testResult" : [
                {
                    "type" : "",
                    "data" : [
                        {
                            "testParameter" : "Ethylene Oxide (sum of ethylene oxide and 2-chloro-ethanol expressed as ethylene oxide)",
                            "testMethod" : "EKA-CHE-SOP-053 (By GC-MS)",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : ""
                        }
                    ]
                }
            ],
            "moleculesAnalysed" : {
                "by" : "",
                "header": [ "Name", "LOQ (mg/kg)"],
                "data": []
            },
            "otherDetails" : {
                "shotCode" :"LOQ: Limit of Quantification (ETO: 0.01 mg/kg),BLQ: Below Limit of Quantification,NA: Not applicable.",
                "conclusion" : "",
                "note": ""
            }
        },
        
        {
            "address" : "CASAPS Trading Pvt Ltd 4a C1 Lane, Sainik Farms, New Delhi-110062",
            "reportCode" : "TR-23-EKA2-015787-01",
            "reportDate" : "2023-06-19",
            "ulrNo" : "",
            "sampleReport" : {
                "sampleCode" : "EKA2-2023-06-000786",
                "sampleName" : "CBD Oil 4500mg",
                "sampleAppearance" : "Greenish brown colour oil",
                "sampleQuantity" : "3 Unit",
                "conditionOnReceipt" : "Good",
                "samplePacking" : "Sealed polythene pack",
                "environmentalConditionDuringSampling" : "Not applicable",
                "customerProvidedDetails" : "Batch No.- AW02",
                "sampleReceiptDate" : "2023-06-07",
                "analysedStateDate" : "2023-06-07",
                "analysedEndDate" : "2023-06-12",
                "SamplingDetails" : "Not Sampled by Eureka",
                "sampleSealNumber" : "Not applicable",
                "samplingProcedure" : "Not applicable",
                "samplingDate" : "Not applicable",
                "samplingLocation" : "Not applicable",
                "jobFileNumber": "Not applicable"
            },
            "authorisedContact" : {
                "name" : "Mr Mohit Tyagi",
                "designation" : "Assistant Manager"
            },
            "testResult" : [
                {
                    "type" : "MYCOTOXINS",
                    "data" : [
                        {
                            "testParameter" : "Aflatoxin B1",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "Max 2.0"
                        },
                        {
                            "testParameter" : "Aflatoxin B2",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "-"
                        },
                        {
                            "testParameter" : "Aflatoxin G1",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "-"
                        },
                        {
                            "testParameter" : "Aflatoxin G2",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "-"
                        },
                        {
                            "testParameter" : "Total Aflatoxin (Sum of B1, B2, G1 & G2)",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "Max 5.0"
                        },
                        {
                            "testParameter" : "Ochratoxin A",
                            "testMethod" : "EKA-CHE-SOP-32 (By HPLC-FLD)",
                            "result" : "BLQ",
                            "unit": "µg/kg ",
                            "limit" : "-"
                        }
                    ]
                },
                {
                    "type" : "INORGANIC",
                    "data" : [
                        {
                            "testParameter" : "Lead",
                            "testMethod" : "EKA-CHE-SOP-043",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "Max 10.0"
                        },
                        {
                            "testParameter" : "Arsenic",
                            "testMethod" : "EKA-CHE-SOP-043",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "Max 3.0"
                        },
                        {
                            "testParameter" : "Cadmium",
                            "testMethod" : "EKA-CHE-SOP-043",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "Max 0.3"
                        },
                        {
                            "testParameter" : "Mercury",
                            "testMethod" : "EKA-CHE-SOP-043",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "Max 1.0"
                        }
                    ]
                },
                {
                    "type" : "PESTICIDES RESIDUES",
                    "data" : [
                        {
                            "testParameter" : "Dithiocarbamates (as CS2)",
                            "testMethod" : "EKA-CHE-SOP-34 (By GC-MSMS)",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "Max 2.0"
                        },
                        {
                            "testParameter" : "All analysed pesticides",
                            "testMethod" : "EKA-CHE-SOP-72 (By LCMSMS & GCSTXMSMS)",
                            "result" : "BLQ",
                            "unit": "mg/kg",
                            "limit" : "-"
                        }
                    ]
                },
                {
                    "type" : "",
                    "data" : [
                        {
                            "testParameter" : "*Cannabidiolic Acid ",
                            "testMethod" : "Internal Method (By HPLC)",
                            "result" : "5400",
                            "unit": "mg/kg",
                            "limit" : ""
                        },
                        {
                            "testParameter" : "*Cannabidiolic",
                            "testMethod" : "Internal Method (By HPLC)",
                            "result" : "300",
                            "unit": "mg/kg",
                            "limit" : ""
                        },
                        {
                            "testParameter" : "*Delta 9 THC",
                            "testMethod" : "Internal Method (By HPLC)",
                            "result" : "5000",
                            "unit": "mg/kg",
                            "limit" : ""
                        },
                        {
                            "testParameter" : "*Tetrahydro Cannabinolic Acid A",
                            "testMethod" : "Internal Method (By HPLC)",
                            "result" : "1400",
                            "unit": "mg/kg",
                            "limit" : ""
                        }
                    ]
                }
            ],
            "moleculesAnalysed" : {
                "by" : "",
                "header": [ "Name", "LOQ (mg/kg)"],
                "data": [
                    {
                        "name" : "Alachlor",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Aldrin and Dieldrin (sum of )",
                        "loq" : "0.01"
                    },{
                        "name" : "Azinphos-methyl",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Bromopropylate",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Chlordane (sum of cis-, trans -and Oxythlordane)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Chlorfenvinphos",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Chlorpyrifos",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Chlorpyrifos-methyl",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Cypermethrin (and isomers)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "DDT (sum of p,p-DDT, o,p-DDT, p,p-DDE and p,p-TDE",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Deltamethrin",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Diazinon",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Dichlorvos",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Endosulfan (sum of isomers and Endosulfan sulphate)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Endrin",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Ethion",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Alachlor",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Fenitrothion",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Heptachlor (sum of Heptachlor and Heptachlorepoxide)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Fenvalerate",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Fonofos",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Hexachlorobenzene",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Hexachlorocyclohexane isomers",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Lindane (Gamma HCH)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Malathion",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Methidathion",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Parathion",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Parathion-methyl",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Permethrin",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Phosalone",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Piperonyl butoxide",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Pirimiphos-methyl",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Pyrethrins (sum of)",
                        "loq" : "0.01"
                    },
                    {
                        "name" : "Quintozene (sum of quintozene, pentachloroaniline and methyl pentachlorophenyl sulphide)",
                        "loq" : "0.01"
                    }
                ]
            },
            "otherDetails" : {
                "shotCode" : "BLQ: Below Limit of Quantification, LOQ: Limit of Quantification (Heavy Metals: 0.05 mg/kg, Mycotoxin: 0.5 µg/kg)",
                "conclusion" : "The analysed sample is in accordance to THE AYURVEDIC PHARMACOPOEIA OF INDIA in its currently valid version, wherever specification available.",
                "note": "Conclusion is provided with respect to above tested parameters only."
            }
        }
    ];
    response.status(200).json(obj);
});


router.get("/", async (request, response)=>{
    let orderObj = [
        {
            'orderId' : 'cc542e3575b66e7e18da4efea5bd5dd0',
            'total': 35,
            'addressId': 1,
            'items' : [
                {
                    'id' : 348,
                    'title' : 'Pack of 6',
                    'sku': 'sku001',
                    'quantity': 1,
                    'price':'5',
                    'currency': 'INR'
                },
                {
                    'id' : 349,
                    'title' : 'boAt Rockerz 400',
                    'sku': 'SKU002',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                },
                {
                    'id' : 350,
                    'title' : 'boAt Rockerz 500',
                    'sku': 'SKU003',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                }
            ]
        },
        {
            'orderId' : '05dc4db56eecf0bbe86ecd5b32b0bd8a',
            'total': 35,
            'addressId': 1,
            'items' : [
                {
                    'id' : 348,
                    'title' : 'Pack of 6',
                    'sku': 'sku001',
                    'quantity': 1,
                    'price':'5',
                    'currency': 'INR'
                },
                {
                    'id' : 349,
                    'title' : 'boAt Rockerz 400',
                    'sku': 'SKU002',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                },
                {
                    'id' : 350,
                    'title' : 'boAt Rockerz 500',
                    'sku': 'SKU003',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                }
            ]
        },
        {
            'orderId' : 'bb6aa9a0e4459e44dd1161f8151bf5b8',
            'total': 35,
            'addressId': 1,
            'items' : [
                {
                    'id' : 348,
                    'title' : 'Pack of 6',
                    'sku': 'sku001',
                    'quantity': 1,
                    'price':'5',
                    'currency': 'INR'
                },
                {
                    'id' : 349,
                    'title' : 'boAt Rockerz 400',
                    'sku': 'SKU002',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                },
                {
                    'id' : 350,
                    'title' : 'boAt Rockerz 500',
                    'sku': 'SKU003',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                }
            ]
        },
        {
            'orderId' : 'a4113f6a28d807ec67864284c4c8fa7f',
            'total': 35,
            'addressId': 1,
            'items' : [
                {
                    'id' : 348,
                    'title' : 'Pack of 86',
                    'sku': 'sku001',
                    'quantity': 1,
                    'price':'5',
                    'currency': 'INR'
                },
                {
                    'id' : 849,
                    'title' : 'boAt Rockerz 408',
                    'sku': 'SKU802',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                },
                {
                    'id' : 850,
                    'title' : 'boAt Rockerz 508',
                    'sku': 'SKU803',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                }
            ]
        },
        {
            'orderId' : '136dbce2a64017352c433586441b961f',
            'total': 35,
            'addressId': 9,
            'items' : [
                {
                    'id' : 948,
                    'title' : 'Pack of 96',
                    'sku': 'sku901',
                    'quantity': 1,
                    'price':'5',
                    'currency': 'INR'
                },
                {
                    'id' : 949,
                    'title' : 'boAt Rockerz 409',
                    'sku': 'SKU902',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                },
                {
                    'id' : 950,
                    'title' : 'boAt Rockerz 509',
                    'sku': 'SKU903',
                    'quantity': 1,
                    'price':'15',
                    'currency': 'INR'
                }
            ]
        }
    ]
    response.status(200).json(orderObj);
});

router.get("/product", async (request, response)=>{
    let productObj = [
		{
            "productID": 1,
            "productName": "iPhone 15",
            "productDescription": "Apple iPhone 15 Plus (256 GB) - Blue",
            "price": 99900,
            "discountPercentage": 0,
            "rating": 4.69,
            "stock": 94,
            "brand": "Apple",
            "category": "smartphones",
			"location": "Bangalore"
        },
		{
            "productID": 2,
            "productName": "iPhone 15 Pro",
            "productDescription": "Apple iPhone 15 Pro (1 TB) - Blue Titanium",
            "price": 184900,
            "discountPercentage": 10,
            "rating": 4.79,
            "stock": 94,
            "brand": "Apple",
            "category": "smartphones",
			"location": "Bangalore"
        },
		{
            "productID": 3,
            "productName": "iPhone 14",
            "productDescription": "Apple iPhone 14 (128 GB) - Blue",
            "price": 61999,
            "discountPercentage": 22,
            "rating": 4.57,
            "stock": 83,
            "brand": "Apple",
            "category": "smartphones",
			"location": "Bangalore"
        },
        {
            "productID": 4,
            "productName": "iPhone 14 Pro Max",
            "productDescription": "Apple iPhone 14 Pro Max (256 GB) - Space Black",
            "price": 899,
            "discountPercentage": 17.94,
            "rating": 4.54,
            "stock": 34,
            "brand": "Apple",
            "category": "smartphones",
			"location": "Bangalore"
        },
        {
            "productID": 5,
            "productName": "iPhone 13",
            "productDescription": "Apple iPhone 13 (128GB) - MproductIDnight",
            "price": 52499,
            "discountPercentage": 12.00,
            "rating": 4.65,
            "stock": 94,
            "brand": "Apple",
            "category": "smartphones",
			"location": "Bangalore"
        }
    ]
    response.status(200).json(productObj);
});

router.get("/order-detail", async (request, response)=>{
    let orderObj = [
        {
            'orderId' : 'cc542e3575b66e7e18da4efea5bd5dd0',
			'orderDate': '2023-09-29',
			'firstName':'Pooja',
			'lastName':'Anand',
            'addressId': 1,
            'product' : [
                {
					"productID": 1,
					"productName": "iPhone 15",
					"productDescription": "Apple iPhone 15 Plus (256 GB) - Blue",
					"price": 99900,
					"discountPercentage": 0,
					"rating": 4.69,
					"stock": 94,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				},
				{
					"productID": 2,
					"productName": "iPhone 15 Pro",
					"productDescription": "Apple iPhone 15 Pro (1 TB) - Blue Titanium",
					"price": 184900,
					"discountPercentage": 10,
					"rating": 4.79,
					"stock": 94,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				}
            ]
        },
        {
            'orderId' : '05dc4db56eecf0bbe86ecd5b32b0bd8a',
			'orderDate': '2023-09-29',
			'firstName':'Pooja',
			'lastName':'Anand',
            'addressId': 1,
            'product' : [
                {
					"productID": 1,
					"productName": "iPhone 15",
					"productDescription": "Apple iPhone 15 Plus (256 GB) - Blue",
					"price": 99900,
					"discountPercentage": 0,
					"rating": 4.69,
					"stock": 94,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				}
            ]
        },
        {
            'orderId' : 'bb6aa9a0e4459e44dd1161f8151bf5b8',
			'orderDate': '2023-09-29',
			'firstName':'Pooja',
			'lastName':'Anand',
            'addressId': 1,
            'product' : [
                {
					"productID": 3,
					"productName": "iPhone 14",
					"productDescription": "Apple iPhone 14 (128 GB) - Blue",
					"price": 61999,
					"discountPercentage": 22,
					"rating": 4.57,
					"stock": 83,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				}
            ]
        },
        {
            'orderId' : 'a4113f6a28d807ec67864284c4c8fa7f',
			'orderDate': '2023-09-29',
			'firstName':'Pooja',
			'lastName':'Anand',
            'addressId': 1,
            'product' : [
                {
					"productID": 4,
					"productName": "iPhone 14 Pro Max",
					"productDescription": "Apple iPhone 14 Pro Max (256 GB) - Space Black",
					"price": 899,
					"discountPercentage": 17.94,
					"rating": 4.54,
					"stock": 34,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				}
            ]
        },
        {
            'orderId' : '136dbce2a64017352c433586441b961f',
			'orderDate': '2023-09-29',
			'firstName':'Pooja',
			'lastName':'Anand',
            'addressId': 9,
            'product' : [
                {
					"productID": 5,
					"productName": "iPhone 13",
					"productDescription": "Apple iPhone 13 (128GB) - MproductIDnight",
					"price": 52499,
					"discountPercentage": 12.00,
					"rating": 4.65,
					"stock": 94,
					"brand": "Apple",
					"category": "smartphones",
					"location": "Bangalore"
				}
            ]
        }
    ]
    response.status(200).json(orderObj);
});

module.exports = router;
