// import axios from "axios";
// import _default from "../config/default";
// export enum SMSType {
//   REGULAR = 0,
//   FLASH = 1,
//   WAP_PUSH = 2,
// }

// export interface SMS {
//   recipient: string;
//   type: SMSType;
//   url?: string;
//   text: string;
// }

// export const sendSmsXML = (smsData: SMS) => {
//   const xmlBodyStr = `<?xml version="1.0" encoding="utf-8" ?>
//     <package login="${_default.smsLogin}" password="${_default.smsPassword}">
//      <message>
//      <default sender="MESSAGE"/>
//         <msg recipient="${smsData.recipient}" sender="${_default.smsSender}" url="${smsData.url}" type="${smsData.type}">${smsData.text}</msg>
//      </message>
//     </package>
//     `;

//   const config = {
//     headers: { "Content-Type": "text/xml" },
//   };

//   axios.post(_default.smsDomain, xmlBodyStr, config);
// };
