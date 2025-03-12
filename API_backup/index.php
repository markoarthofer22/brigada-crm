<?php


namespace CMS;

use PP\Classes\Database;
use PP\Classes\Helper;
use PP\Classes\Language;
use PP\Classes\Message;
use PP\Classes\Users;
use PP\Controller\CustomController;
use PP\Controller\CustomersController;
use PP\Controller\DirectInjectionController;
use PP\Controller\ExportLinehaulController;
use PP\Controller\SettingsController;
use PP\Controller\FilesController;
use PP\Controller\ICSController;
use PP\Controller\SMMController;
use PP\Controller\IT4EMController;
use PP\Controller\LinehaulController;
use PP\Controller\TestController;
use PP\Controller\UsersController;
use PP\Controller\DetailedController;
use PP\Controller\SalesPeopleController;
use PP\Controller\StatusController;
use PP\Controller\ImportController;
use PP\Controller\CalculateController;
use PP\Controller\CleanController;
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
if ($headers["csid"]) {
	session_id($headers["csid"]);
}

session_start();
$_SESSION["sid"] = session_id();
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
/// MIDDLEWARE ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$middleware = function (Request $request, Response $response, $next): Response {
	$db = Database::Connection($_SESSION["database_suffix"]);
	$Helper = new Helper($db);

	// $logs = new SaveLog($db);

	//////// BEFORE //////////////////
	$vars = $request->getParsedBody() ? $request->getParsedBody() : array();
	$query = $request->getQueryParams() ? $request->getQueryParams() : array();
	// $args = $request->getAttribute("routeInfo")[2];
	$method = $request->getMethod();
	$path = $request->getUri()->getPath();
	// $logs->Write($path, $vars, $query, $method);

	//////// NEXT //////////////////
	$response = $next($request, $response);

	//////// AFTER //////////////////
	$status = $response->getStatusCode();
	$body = json_decode($response->getBody());
	// $body = $Helper->ArrayToObject($body);
	$body->sid = $_SESSION["sid"];
	$body->lang = $_SESSION["lang"];
	$body->memory_get_usage = $Helper->formatBytes(memory_get_usage(true));
	$body->memory_get_peak_usage = $Helper->formatBytes(memory_get_peak_usage(true));

	// if (is_array($body) || is_object($body)) {
	// 	$body = json_encode($body);
	// }


	// $logs->Update($_SESSION["LID"], $status, $body);

	return $response->withJson($body);
};

$auth = function (Request $request, Response $response, $next): Response {
	$db = Database::Connection($_SESSION["database_suffix"]);
	$User = new Users($db);
	$Language = new Language($db);

	$headers = apache_request_headers();
	$token = trim(str_replace("Bearer", "", $headers["Authorization"] ? $headers["Authorization"] : $headers["authorization"]));

	// if ($token) {
	// 	$login = $user->LoginWithToken($token);
	// 	if ($login != new stdClass) {
	// 		$user->UserSession($login->id_cms_users);
	// 	} else {
	// 		$user->Logout();
	// 	}
	// }

	if (!$User->isUserLogedIn()) {
		return Message::WriteMessage(401, array("Message" => $Language->Translate(array("phrase" => "Unathorized"))), $response);
	}

	$response = $next($request, $response);

	return $response;
};




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// API ROUTES ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

$app->group('', function () use ($app, $auth) {

	$app->get('/', function (Request $request, Response $response, array $args) {
		$out = new stdClass;
		$out->message = "OK";
		return $response->withJson($out, 200);
	});

	$app->group('/user', function () use ($app) {
		$app->post('/login', UsersController::class . ":Login");
		$app->post('/logout', UsersController::class . ":Logout");
	});

	$app->group('/files', function () use ($app) {
		$app->get('', FilesController::class);
		$app->post('/upload', FilesController::class . ":Upload");
		$app->post('/delete', FilesController::class . ":Delete");
		$app->get('/download', FilesController::class . ":Download");
	})->add($auth);

	$app->group('/data', function () use ($app, $auth) {
		$app->group('/directinjection', function () use ($app) {
			$app->get('', DirectInjectionController::class . ":Get");
			$app->put('/{id}', DirectInjectionController::class . ":Update");
		})->add($auth);

		$app->group('/custom', function () use ($app) {
			$app->get('', CustomController::class . ":Get");
			$app->post('', CustomController::class . ":Insert");
			$app->put('/{id}', CustomController::class . ":Update");
			$app->delete('/{id}', CustomController::class . ":Delete");
		})->add($auth);

		$app->group('/customers', function () use ($app) {
			$app->get('', CustomersController::class . ":Get");
		})->add($auth);

		$app->group('/salespeople', function () use ($app) {
			$app->get('', SalesPeopleController::class . ":Get");
		})->add($auth);
	});

	$app->group('/mappings', function () use ($app, $auth) {
		$app->group('/it4em', function () use ($app) {
			$app->get('', IT4EMController::class . ":Get");
			$app->post('', IT4EMController::class . ":Insert");
			$app->put('/{id}', IT4EMController::class . ":Update");
			$app->delete('/{id}', IT4EMController::class . ":Delete");
		})->add($auth);

		$app->group('/ics', function () use ($app) {
			$app->get('', ICSController::class . ":Get");
			$app->post('', ICSController::class . ":Insert");
			$app->put('/{id}', ICSController::class . ":Update");
			$app->delete('/{id}', ICSController::class . ":Delete");
		})->add($auth);

		$app->group('/smm', function () use ($app) {
			$app->get('', SMMController::class . ":Get");
			// $app->post('', SMMController::class . ":Insert");
			$app->put('/{id}', SMMController::class . ":Update");
			// $app->delete('/{id}', SMMController::class . ":Delete");
		})->add($auth);

		$app->group('/linehaul', function () use ($app) {
			$app->get('', LinehaulController::class . ":Get");
			$app->post('', LinehaulController::class . ":Insert");
			$app->put('/{id}', LinehaulController::class . ":Update");
			$app->delete('/{id}', LinehaulController::class . ":Delete");
		})->add($auth);

		$app->group('/exportlinehaul', function () use ($app) {
			$app->get('', ExportLinehaulController::class . ":Get");
			$app->post('', ExportLinehaulController::class . ":Insert");
			$app->put('/{id}', ExportLinehaulController::class . ":Update");
			$app->delete('/{id}', ExportLinehaulController::class . ":Delete");
		})->add($auth);
	});

	$app->group('/reports', function () use ($app, $auth) {
		$app->group('/linehaul', function () use ($app) {
			$app->get('', LinehaulController::class . ":GetAverage");
		})->add($auth);

		$app->group('/calculate', function () use ($app) {
			$app->post('/download/delete', CalculateController::class . ":Delete");
			$app->get('/download', CalculateController::class . ":Download");
			$app->get('', CalculateController::class . ":Get");
		})->add($auth);

		$app->group('/detailed', function () use ($app) {
			$app->post('/download/delete', DetailedController::class . ":Delete");
			$app->post('/download', DetailedController::class . ":Download");
			$app->get('/data', DetailedController::class . ":Data");
			$app->post('', DetailedController::class . ":Get");
		})->add($auth);

		$app->group('/status', function () use ($app) {
			$app->put('/module/{id}', StatusController::class . ":Update");
			$app->get('', StatusController::class . ":GetAll");
			$app->put('/{id}', StatusController::class . ":Update");
		})->add($auth);
	});

	$app->group('/settings', function () use ($app, $auth) {
		$app->get('', SettingsController::class);
		$app->get('/app', SettingsController::class . ":Get")->add($auth);
		$app->post('/app', SettingsController::class . ":Insert")->add($auth);
		$app->put('/app/{id}', SettingsController::class . ":Update")->add($auth);
		$app->delete('/app/{id}', SettingsController::class . ":Delete")->add($auth);
	});

	$app->group('/import', function () use ($app) {
		$app->get('', ImportController::class);
	});

	$app->group('/sanitize', function () use ($app) {
		$app->get('', CleanController::class);
	});

	$app->group('/test', function () use ($app) {
		$app->get('/', TestController::class . ":Get");
		$app->get('/pp', TestController::class . ":PP");
		$app->get('/info', TestController::class . ":Info");
		$app->get('/oci', TestController::class . ":oci");
	});
})->add($middleware);


//SLIM NO ROUTE IS FOUND
$container['notFoundHandler'] = function () {
	return function (Request $request, Response $response) {
		return $response->withStatus(404);
	};
};

$app->run();
