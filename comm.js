function getParameter(paraName)
{
    var urlStr=location.href;
    var queryStr=((urlStr.split("?"))[1].split("#"))[0];
    var queryParaList=queryStr.split("&");
    var queryValue="";
    for(var i=0;i<queryParaList.length;i++)
    {
        var queryParaName=(queryParaList[i].split("="))[0];
        if(queryParaName==paraName)
        {
            queryValue=(queryParaList[i].split("="))[1];
            break;
        }
    }
    return queryValue;
}
