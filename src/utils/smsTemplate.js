export const getTemplateText = (templateId,content)=>{
 const templateIds = {
    "1307166245390254219":`UKUCC- ${content} is your one time password (content) for mobile number verification.`,
    "1307166245390254220":`UKUCC- ${content} Successfully sing up.`
}
return templateIds[templateId];
}