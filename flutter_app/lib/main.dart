import 'package:flutter/material.dart';

// don't forget this line
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF004C00),
        colorScheme: ColorScheme.fromSwatch(primarySwatch: Colors.green).copyWith(background: const Color(0xFF004C00)),
      ),
      title: "Terrain | Summit",
      home: const Terrain(),
    );
  }
}
class Terrain extends StatefulWidget {
  const Terrain({super.key});

  @override
  State<Terrain> createState() => TerrainState();
}

class TerrainState extends State<Terrain> {
  late final WebViewController _controller;

  @override
  void initState(){
    super.initState();

  final WebViewController controller = WebViewController();
  // Create a webview controller
  controller
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..setNavigationDelegate(
      NavigationDelegate(
        onProgress: (int progress) {
          // print the loading progress to the console
          // you can use this value to show a progress bar if you want
          debugPrint("Loading: $progress%");
          controller.runJavaScript("""
            const buttonHTML = `
              <button id="summitButton" style="display: none;" 
                onclick="
                  const css1  = document.createElement('link');
                  css1.rel = 'stylesheet';
                  css1.type = 'text/css';
                  css1.href = 'https://cdn.jsdelivr.net/combine/npm/terrain-summit/summit.min.css,npm/terrain-summit/dependencies/datatables.min.css,npm/terrain-summit/dependencies/flatpickr.min.css';
                  document.head.appendChild(css1);
                  const summitScript = document.createElement('script');
                  summitScript.id = 'summit-script'; 
                  summitScript.src = 'https://cdn.jsdelivr.net/npm/terrain-summit@latest/summit.js'; 
                  summitScript.async = true; 
                  document.head.appendChild(summitScript);
                ">
              </button>
            `;
            document.body.insertAdjacentHTML('beforeend', buttonHTML);
            document.getElementById('summitButton').click();
            document.body.removeChild(document.getElementById('summitButton'));
            """ );
        },
        onPageStarted: (String url) {},
        onPageFinished: (String url) {
          // when the page is finished loading, print the url to the console
          debugPrint("Finished loading: $url");
        },
        onWebResourceError: (WebResourceError error) {},
        onNavigationRequest: (NavigationRequest request) {
          return NavigationDecision.navigate;
        },
      ),
    )
    ..addJavaScriptChannel(
        'Toaster',
        onMessageReceived: (JavaScriptMessage message) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(message.message)),
          );
        })
    ..loadRequest(Uri.parse("https://terrain.scouts.com.au/"))
    ..runJavaScript("console.log('starting...');");
        // #docregion platform_features
    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    // #enddocregion platform_features

    _controller = controller;
  }
    

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const TitleSection(),
        backgroundColor: const Color(0xFF004C00),
        toolbarHeight: 35,
        actions: <Widget>[
          NavigationControls(webViewController: _controller),
          SummitMeun(webViewController: _controller),
        ],
      ),
      body: SizedBox(
          width: double.infinity,
          // the most important part of this example
          child: WebViewWidget(
            controller: _controller,
          )),
    );
  }
}

class TitleSection extends StatelessWidget {
  const TitleSection({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(1),
      child: Row(
        children: [
          Expanded(
            /*1*/
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                /*2*/
                const Text(
                  "Summit | Terrian",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  "Where every achievement is a summit conquered.",
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

enum MenuOptions {
  basecamp,
  terrainDetails,
  clearCache,

}

class SummitMeun extends StatelessWidget {
  SummitMeun({
    super.key,
    required this.webViewController,
  });

  final WebViewController webViewController;
  late final WebViewCookieManager cookieManager = WebViewCookieManager();

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<MenuOptions>(
      key: const ValueKey<String>('ShowPopupMenu'),
      iconColor: Colors.white,
      onSelected: (MenuOptions value) {
        switch (value) {
          case MenuOptions.clearCache:
            _onClearCache(context);
          case MenuOptions.terrainDetails:
            _onGetTerrainDetails();
          default:
            webViewController.reload();
        }
      },
      itemBuilder: (BuildContext context) => <PopupMenuItem<MenuOptions>>[
        const PopupMenuItem<MenuOptions>(
          value: MenuOptions.terrainDetails,
          child: Text('Show Terrain Details'),
        ),
        const PopupMenuItem<MenuOptions>(
          value: MenuOptions.clearCache,
          child: Text('Clear cache'),
        ),
        const PopupMenuItem<MenuOptions>(
          value: MenuOptions.basecamp,
          child: Text('Reload Terrain'),
        ),
      ],
    );
  }
  Future<void> _onClearCache(BuildContext context) async {
    await webViewController.clearCache();
    await webViewController.clearLocalStorage();
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Cache cleared.'),
      ));
    }
  }
  Future<void> _onGetTerrainDetails() {
    // Send a message with the user agent string to the Toaster JavaScript channel we registered
    // with the WebView.
    return webViewController.runJavaScript(
      """Toaster.postMessage(`
Summit Web Version: \${SummitContext.getInstance().summitVersion}
Summit Update Availiable: \${SummitContext.getInstance().upgradeAvailable ? "Yes" : "No"}
User ID: \${\$nuxt.\$store.state.user.username}
Current Unit: \${\$nuxt.\$store.state.user.profiles[\$nuxt.\$store.state.user.profileIndex].unit.name}     
Current Group: \${\$nuxt.\$store.state.user.profiles[\$nuxt.\$store.state.user.profileIndex].group.name}
      `);""",
    );
  }
}

class NavigationControls extends StatelessWidget {
  const NavigationControls({super.key, required this.webViewController});

  final WebViewController webViewController;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        IconButton(
          icon: const Icon(Icons.replay),
          onPressed: () => webViewController.reload(),
          color: Colors.white,
        ),
      ],
    );
  }
}

