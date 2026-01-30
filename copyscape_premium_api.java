import java.io.*;
import java.util.*;
import java.net.*;
import javax.xml.parsers.*;
import org.xml.sax.SAXException;
import org.xml.sax.InputSource;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;
import javax.servlet.http.*;

public class Copyscape extends HttpServlet 
{
/*
	Java sample code for Copyscape Premium API
	
	Compatible with Java Runtime Environment 1.5 or later
	
	You may install, use, reproduce, modify and redistribute this code, with or without
	modifications, subject to the general Terms and Conditions on the Copyscape website. 
	
	For any technical assistance please contact us via our website.
	
	07-May-2013: First version
	
	Copyscape (c) Indigo Stream Technologies 2013 - http://www.copyscape.com/

	Instructions for use:
	
	1. Set the constants COPYSCAPE_USERNAME and COPYSCAPE_API_KEY below to your details.
	2. Call the appropriate API function, following the examples below.
	3. The API response is in XML, which in this sample code is parsed and returned as a Node.
	4. To run the examples provided, please set run_examples in the line below to true:
*/
	public static boolean run_examples = false;
/*
	Error handling:
	
	* If a call failed completely (e.g. URLConnection failed to connect), functions return null.
	* If the API returned an error, the response Node tree will contain an "error" element.
*/

/*
	A. Constants you need to change
*/

	public static final String COPYSCAPE_USERNAME = "your-copyscape-username";
	public static final String COPYSCAPE_API_KEY = "your-copyscape-api-key";
	
	public static final String COPYSCAPE_API_URL = "http://www.copyscape.com/api/";

/*
	B. Functions for you to use (all accounts)
*/
	static public Node copyscape_api_url_search_internet (String url, int full)
	{
		return copyscape_api_url_search( url, full, "csearch");
	}
	
	static public Node copyscape_api_text_search_internet (String text, String encoding, int full)
	{
		return copyscape_api_text_search(text, encoding, full, "csearch");
	}
	
	static public Node copyscape_api_check_balance ()
	{
		return copyscape_api_call("balance", null, null, null);
	}
	
/*
	C. Functions for you to use (only accounts with private index enabled)
*/	
	static public Node copyscape_api_url_search_private (String url, int full)
	{
		return copyscape_api_url_search(url, full, "psearch");
	}
	
	static public Node copyscape_api_url_search_internet_and_private (String url, int full)
	{
		return copyscape_api_url_search(url, full, "cpsearch");
	}

	static public Node copyscape_api_text_search_private (String text, String encoding, int full)
	{
		return copyscape_api_text_search(text, encoding, full, "psearch");
	}
	
	static public Node copyscape_api_text_search_internet_and_private (String text, String encoding, int full)
	{
		return copyscape_api_text_search(text, encoding, full, "cpsearch");
	}
	
	static public Node copyscape_api_url_add_to_private (String url, String id)
	{
		Map<String,String> params = new HashMap<String, String>();
		
		params.put("q", url);
		
		if (id != null)
			params.put("i", id);
			
		return copyscape_api_call("pindexadd", params, null, null);
	}
	
	static public Node copyscape_api_text_add_to_private (String text, String encoding, String title, String id)
	{
		Map<String,String> params = new HashMap<String, String>();
		params.put("e", encoding);
		
		if (title != null)
			params.put("a", title);

		if (id != null)
			params.put("i", id);
			
		return copyscape_api_call("pindexadd", params, encoding, text);
	}
	
	static public Node copyscape_api_delete_from_private (String handle)
	{
		Map<String,String> params = new HashMap<String, String>();
		params.put("h", handle);
		
		return copyscape_api_call("pindexdel", params, null, null);
	}
	
/*
	D. Functions used internally
*/
	static String HTMLEncode (String text)
	{
	    StringBuffer out = new StringBuffer();
	    for(int i=0; i<text.length(); i++)
	    {
	        char c = text.charAt(i);
	        if(c > 127 || c=='"' || c=='<' || c=='>')
	           out.append("&#"+(int)c+";");
	        else
	            out.append(c);
	    }
	    return out.toString();
	}

	public static String wrap_title (String title)
    {
		return new String("<big style='margin-left:5%'><b>"+HTMLEncode(title)+":</b></big>");
	}

	public static String wrap_node (Node node)
    {
    	return new String("<div style='overflow:auto; max-height:300px; margin-left:5%; width:90%'><pre>"+node_recurse(node,0)+"</pre></div><br>");
	}
	
	private static String node_recurse (Node node, int depth )
    {
    	String ret = "";
    	
		if (node == null)
			return ret;

		if (node.getNodeType() == Node.TEXT_NODE)
		{
			ret += HTMLEncode(node.getNodeValue());
		}
		else 
		{
			ret += "\n";
			for (int i=0; i<depth; i++)
				ret +="\t";
			ret += node.getNodeName() + ": "; 
		}

		if (node.getChildNodes().getLength() > 0)
        {
			for (int i=0; i < node.getChildNodes().getLength(); i++)
				ret += node_recurse( node.getChildNodes().item(i), depth+1 );
		}

		return ret;
	}

	static Node copyscape_api_url_search (String url, int full, String operation)
	{
		Map<String,String> params = new HashMap<String, String>();
		params.put("q", url);

		if (full != 0)
			params.put("c", String.valueOf(full));
		
		return copyscape_api_call(operation, params, null, null);
	}
	
	static Node copyscape_api_text_search (String text, String encoding, int full, String operation)
	{
		Map<String,String> params = new HashMap<String, String>();
		params.put("e", encoding);

		if (full != 0)
			params.put("c", String.valueOf(full));

		return copyscape_api_call(operation, params, encoding, text);
	}

	static Node copyscape_api_call (String operation, Map<String,String> params, String encoding, String postdata)
	{ 
		try {
			if (encoding == null)
				encoding = "UTF-8";
				
			String url = COPYSCAPE_API_URL + "?u=" + URLEncoder.encode(COPYSCAPE_USERNAME, encoding) +
				"&k=" + URLEncoder.encode(COPYSCAPE_API_KEY, encoding) + "&o=" + URLEncoder.encode(operation, encoding);
				
			if (params != null) 
			{
				Iterator it = params.entrySet().iterator();
				while (it.hasNext()) 
				{
			    	Map.Entry pairs = (Map.Entry)it.next();
			    	url = url + "&" + URLEncoder.encode((String)pairs.getKey(), encoding) + "=" + 
			    		URLEncoder.encode((String)pairs.getValue(), encoding);
			    	it.remove();
				}		
			}
		
			HttpURLConnection urlConn;

			URL mUrl = new URL(url);
			urlConn = (HttpURLConnection) mUrl.openConnection();
			
			urlConn.setDoInput(true);
        	urlConn.setDoOutput(true);
        	urlConn.setUseCaches(false);
			urlConn.setRequestMethod(postdata == null ? "GET" : "POST");
			urlConn.addRequestProperty("Content-Type", "application/x-www-form-urlencoded");
			urlConn.setConnectTimeout(5000);
			
			if (postdata != null) 
			{
				BufferedWriter output = new BufferedWriter(new OutputStreamWriter(urlConn.getOutputStream(),encoding));
				output.write(postdata);
				output.flush();				
			}
					
			BufferedReader input = new BufferedReader(new InputStreamReader(urlConn.getInputStream(), encoding));
			String line, response = "";
	    	while ((line = input.readLine()) != null)
	        	response = response + line;
	    	input.close();
	    
	    	DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
			DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
			Document doc = dBuilder.parse(new InputSource(new StringReader(response)));

			return doc.getDocumentElement();
		} 
		catch(IOException ioe) { System.err.print("Error: "+ioe.getMessage()); }
		catch(ParserConfigurationException pce) { System.err.print("Error: "+pce.getMessage()); }
		catch(SAXException se) { System.err.print("Error: "+se.getMessage()); }
		
		return null;
	}
	
	static String copyscape_read_xml (Node doc, String spec)
	{
		String ret = doc.getNodeName() + ": ";
		NodeList nodeList = doc.getChildNodes();
		if (nodeList.getLength() == 0)
			return ret + doc.getNodeValue() + "\n";

		for (int i=0; i<nodeList.getLength(); i++)
		{
			ret = ret + copyscape_read_xml(nodeList.item(i), spec);		
		}
		
		return ret;
	}
	
/*
	E. Some examples of use
*/	
	protected void doGet (HttpServletRequest hs_request, HttpServletResponse hs_response) 
	{
		try
		{
			hs_response.setContentType ("text/html");
			PrintWriter writer = hs_response.getWriter();

			if (Copyscape.run_examples != true)
				return;
				
			String exampletext="We hold these truths to be self-evident, that all men are created equal, that they are endowed by their "+
				"Creator with certain unalienable rights, that among these are Life, Liberty, and the pursuit of Happiness. That to "+
				"secure these rights, Governments are instituted among Men, deriving their just powers from the consent of the "+
				"governed. That whenever any Form of Government becomes destructive of these ends, it is the Right of the People to "+
				"alter or to abolish it, and to institute new Government, laying its foundation on such principles and organizing "+
				"its powers in such form, as to them shall seem most likely to effect their Safety and Happiness. Prudence, indeed, "+
				"will dictate that Governments long established should not be changed for light and transient causes; and "+
				"accordingly all experience hath shown, that mankind are more disposed to suffer, while evils are sufferable, than "+
				"to right themselves by abolishing the forms to which they are accustomed. But when a long train of abuses and "+
				"usurpations, pursuing invariably the same Object evinces a design to reduce them under absolute Despotism, it is "+
				"their right, it is their duty, to throw off such Government, and to provide new Guards for their future security. "+
				"Such has been the patient sufferance of these Colonies; and such is now the necessity which constrains them to "+
				"alter their former Systems of Government. The history of the present King of Great Britain is a history of "+
				"repeated injuries and usurpations, all having in direct object the establishment of an absolute Tyranny over these "+
				"States. To prove this, let Facts be submitted to a candid world. He has refused his Assent to Laws, the most "+
				"wholesome and necessary for the public good. "+
				"We, therefore, the Representatives of the United States of America, in General Congress, Assembled, "+
				"appealing to the Supreme Judge of the world for the rectitude of our intentions, do, in the Name, and by Authority "+
				"of the good People of these Colonies, solemnly publish and declare, That these United Colonies are, and of Right "+
				"ought to be free and independent states; that they are Absolved from all Allegiance to the British Crown, and that "+
				"all political connection between them and the State of Great Britain, is and ought to be totally dissolved; and "+
				"that as Free and Independent States, they have full Power to levy War, conclude Peace, contract Alliances, "+
				"establish Commerce, and to do all other Acts and Things which Independent States may of right do. And for the "+
				"support of this Declaration, with a firm reliance on the Protection of Divine Providence, we mutually pledge to "+
				"each other our Lives, our Fortunes, and our sacred Honor.";
	
			writer.write( wrap_title("Response for a simple URL Internet search") );		
			writer.write( wrap_node(copyscape_api_url_search_internet("http://www.copyscape.com/example.html", 0)) );
	
			writer.write( wrap_title("Response for a URL Internet search with full comparisons for the first two results") );
			writer.write( wrap_node(copyscape_api_url_search_internet("http://www.copyscape.com/example.html", 2)) );
	
			writer.write( wrap_title("Response for a simple text Internet search") );
			writer.write( wrap_node(copyscape_api_text_search_internet(exampletext, "ISO-8859-1", 0)) );
			
			writer.write( wrap_title("Response for a text Internet search with full comparisons for the first two results") );
			writer.write( wrap_node(copyscape_api_text_search_internet(exampletext, "ISO-8859-1", 2)) );
	
			writer.write( wrap_title("Response for a check balance request") );
			writer.write( wrap_node(copyscape_api_check_balance()) );
		
			writer.write( wrap_title("Response for a URL add to private index request") );
			writer.write( wrap_node(copyscape_api_url_add_to_private("http://www.copyscape.com/example.html", null)) );
		
			writer.write( wrap_title("Response for a text add to private index request") );
			Node response=copyscape_api_text_add_to_private(exampletext, "ISO-8859-1", "Extract from Declaration of Independence", "EXAMPLE_1234");
			writer.write( wrap_node(response) );
			
			String handle="";
			if (response != null )
				for (int i = 0; i < response.getChildNodes().getLength(); i++)
					if (response.getChildNodes().item(i).getNodeName() == "handle")
						handle = response.getChildNodes().item(i).getTextContent();
	
			writer.write( wrap_title("Response for a URL private index search") );
			writer.write( wrap_node(copyscape_api_url_search_private("http://www.copyscape.com/example.html", 0)) );
	
			writer.write( wrap_title("Response for a delete from private index request") );
			writer.write( wrap_node(copyscape_api_delete_from_private(handle)) );
	
			writer.write( wrap_title("Response for a text search of both Internet and private index with full comparisons for the first result (of each type)") );
			writer.write( wrap_node(copyscape_api_text_search_internet_and_private(exampletext, "ISO-8859-1", 1)) );
		}
		catch (IOException e) {System.out.println ("Servlet Exception: " + e.getMessage());}				
	}
}