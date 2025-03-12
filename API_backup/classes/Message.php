<?php

namespace PP\Classes;

use Slim\Http\Response;

/**
 * Message class
 *
 * @author Ivan Gudelj <gudeljiv@gmail.com>
 */
class Message
{

	/**
	 * WriteMessage function
	 *
	 * @param integer $responseCode
	 * @param array $message
	 * @param Response $response
	 * @return Response
	 * @author Ivan Gudelj <gudeljiv@gmail.com>
	 */
	public static function WriteMessage(int $responseCode, array $message, Response $response): Response
	{
		if (is_object($message)) {
			if (method_exists($message, "getMessage")) {
				$e = $message->getMessage();
			} else {
				$e = json_encode($message);
			}
		} else {
			$e = $message;
		}

		$data = array("ResponseCode" => $responseCode, "StatusText" => $e);
		return $response->withJson($data, $responseCode);
	}
}
