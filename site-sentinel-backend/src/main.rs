use axum::{routing::get, Router, Json};
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/hello", get(hello_handler))
        .layer(cors);

    println!("Rust backend running on http://localhost:3001");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn hello_handler() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "message": "Hello from Rust!" }))
}