<?php


namespace CMS;

use PP\Classes\Database;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Logs;
use PP\Classes\Message;
use PP\Classes\Users;
use PP\Controller\ProjectsController;
use PP\Controller\QuestionsController;
use PP\Controller\SettingsController;
use PP\Controller\TestController;
use PP\Controller\UsersController;
use PP\Controller\ZonesController;
use PP\Middleware\Auth;
use PP\Middleware\Main;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

ini_set("display_errors", 1);
ini_set("memory_limit", '4096M');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

// Security Headers
header("X-XSS-Protection: 1; mode=block");
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");

// Handle preflight (OPTIONS) request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	http_response_code(204); // No Content
	exit;
}

require_once __DIR__ . "/vendor/autoload.php";

if (file_exists(__DIR__ . "/../../.env")) { // two up from API
	$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . "/../../");
	$dotenv->load();
} elseif (file_exists(__DIR__ . "/../.env")) { // one up from API
	$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . "/../");
	$dotenv->load();
} elseif (file_exists(__DIR__ . "/.env")) { // in API
	$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . "/");
	$dotenv->load();
} else {
	$protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';
	$code = 412;
	$text = "Missing ENV file";

	header('Content-Type: application/json');
	header($protocol . ' ' . $code . ' ' . $text);
	echo json_encode(array(
		"error" => true,
		"code" => $code,
		"message" => $text
	));
	exit();
}

if ($_ENV["SESSION_SAVEHANDLER"] && $_ENV["SESSION_SAVEHANDLER"] != "") ini_set("session.save_handler", $_ENV["SESSION_SAVEHANDLER"]);
if ($_ENV["SESSION_SAVEPATH"] && $_ENV["SESSION_SAVEPATH"] != "") ini_set("session.save_path", $_ENV["SESSION_SAVEPATH"]);

$headers = apache_request_headers();
if ($headers["Csid"]) {
	session_id($headers["Csid"]);
}

session_start();
$_SESSION["session_id"] = session_id();
$_SESSION["SCHEMA"] = $_ENV["DB_SCHEMA"] ?? 'public';

$container = new \Slim\Container(['settings' => ['displayErrorDetails' => true]]);
$app = new \Slim\App($container);


// TEST OR PRODUCTION BASED ON .env FILE
$_SESSION["database_suffix"] = "";
if (isset($_ENV["PRODUCTION"]) && filter_var($_ENV["PRODUCTION"], FILTER_VALIDATE_BOOL) === true) {
	$_SESSION["database_suffix"] = "";
} else {
	$_SESSION["database_suffix"] = "test";
}

if (!isset($_ENV["DEFAULT_LANG"])) {
	$protocol = isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0';
	$code = 412;
	$text = "Missing ENV DEFAULT_LANG";

	header('Content-Type: application/json');
	header($protocol . ' ' . $code . ' ' . $text);
	echo json_encode(array(
		"error" => true,
		"code" => $code,
		"message" => $text
	));
	exit();
}

$_SESSION["lang"] = isset($_GET["lang"]) ? $_GET["lang"] : (isset($_SESSION["lang"]) ? $_SESSION["lang"] : $_ENV["DEFAULT_LANG"]);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// API ROUTES ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$app->group('', function () use ($app) {

	$app->get('/settings', SettingsController::class)->add([new Auth(), 'Auth']);

	$app->get('/', function (Request $request, Response $response, array $args) {
		$out = new stdClass;
		$out->message = "OK";
		return $response->withJson($out, 200);
	})->add([new Auth(), 'Auth']);

	$app->group('/user', function () use ($app) {
		// $app->get('', UsersController::class . ":GetLogedUser")->add($auth);
		$app->get('', UsersController::class)->add([new Auth(), 'Auth']);
		$app->get('/{id}', UsersController::class . ":Get")->add([new Auth(), 'Auth']);
		$app->post('', UsersController::class . ":Add")->add([new Auth(), 'Auth']);
		$app->put('/{id}', UsersController::class . ":Update")->add([new Auth(), 'Auth']);
		$app->delete('/{id}', UsersController::class . ":Delete")->add([new Auth(), 'Auth']);
		$app->post('/login', UsersController::class . ":Login");
		$app->post('/logout', UsersController::class . ":Logout");
	});

	$app->group('/projects', function () use ($app) {
		$app->get('', ProjectsController::class);
		$app->get('/{id}', ProjectsController::class . ":Get");
		$app->post('', ProjectsController::class . ":Add");
		$app->put('/{id}', ProjectsController::class . ":Update");
		$app->post('/{id}/image', ProjectsController::class . ":UploadImage");
		$app->delete('/{id}', ProjectsController::class . ":Delete");
		$app->delete('/{id}/image/{id_images}', ProjectsController::class . ":DeleteImage");
	})->add([new Auth(), 'Auth']);

	$app->group('/questions', function () use ($app) {
		$app->get('', QuestionsController::class);
		$app->get('/{id}', QuestionsController::class . ":Get");
		$app->post('', QuestionsController::class . ":Add");
		$app->put('/{id}', QuestionsController::class . ":Update");
		$app->delete('/{id}', QuestionsController::class . ":Delete");
	})->add([new Auth(), 'Auth']);

	$app->group('/zones', function () use ($app) {
		$app->get('', ZonesController::class);
		$app->get('/{id}', ZonesController::class . ":Get");
		$app->post('', ZonesController::class . ":Add");
		$app->put('/{id}', ZonesController::class . ":Update");
		$app->delete('/{id}', ZonesController::class . ":Delete");
	})->add([new Auth(), 'Auth']);

	// $app->group('/test', function () use ($app) {
	// 	$app->get('/', TestController::class . ":Get");
	// 	$app->get('/pp', TestController::class . ":PP");
	// 	$app->get('/info', TestController::class . ":Info");
	// 	$app->get('/oci', TestController::class . ":oci");
	// });
})->add([new Main(), 'Logs']);


//SLIM NO ROUTE IS FOUND
$container['notFoundHandler'] = function () {
	return function (Request $request, Response $response) {
		return $response->withStatus(404);
	};
};

$app->run();
