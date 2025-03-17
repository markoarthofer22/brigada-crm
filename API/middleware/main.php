<?php

namespace PP\Middleware;

use Exception;
use PDO;
use PP\Classes\Database;
use PP\Classes\Helper;
use PP\Classes\Logs;
use Slim\Http\Request;
use Slim\Http\Response;
use stdClass;

/**
 * Main class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Main
{

	/**
	 * Logs function
	 *
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public function Logs(Request $request, Response $response, $next): Response
	{
		$db = Database::Connection($_SESSION["database_suffix"]);
		$Helper = new Helper($db);
		$Logs = new Logs($db);

		// $logs = new SaveLog($db);

		//////// BEFORE //////////////////
		$vars = $request->getParsedBody() ? $request->getParsedBody() : array();
		$query = $request->getQueryParams() ? $request->getQueryParams() : array();
		// $args = $request->getAttribute("routeInfo")[2];
		$method = $request->getMethod();
		$path = $request->getUri()->getPath();
		$logs_id = $Logs->Write($path, $vars, $query, $method);

		//////// NEXT //////////////////
		$response = $next($request, $response);

		//////// AFTER //////////////////
		$status = $response->getStatusCode();
		$body = ($content = $response->getBody()) ? json_decode($content, false) ?? [] : [];

		if (is_array($body)) {
			$body["session_id"] = $_SESSION["session_id"];
			$body["lang"] = $_SESSION["lang"];
			$body["memory_get_usage"] = $Helper->formatBytes(memory_get_usage(true));
			$body["memory_get_peak_usage"] = $Helper->formatBytes(memory_get_peak_usage(true));
		}
		if (is_object($body)) {
			$body->session_id = $_SESSION["session_id"];
			$body->lang = $_SESSION["lang"];
			$body->memory_get_usage = $Helper->formatBytes(memory_get_usage(true));
			$body->memory_get_peak_usage = $Helper->formatBytes(memory_get_peak_usage(true));
		}


		// if (is_array($body) || is_object($body)) {
		// 	$body = json_encode($body);
		// }

		$Logs->Update($logs_id, $status, $body);

		return $response->withJson($body);
	}
}
