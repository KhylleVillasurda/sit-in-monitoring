use axum::{routing::get, Router, Json};
use tower_http::cors::{CorsLayer, Any};
use sqlx::sqlite::SqlitePoolOptions;
use std::env;

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    //Database setup
    let _pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("✅ Database connection established!");

    

    //Initial Setup
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/api/hello", get(hello_handler))
        .layer(cors);

    println!("Rust backend running on http://localhost:3001");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    axum::serve(listener, app).await.map_err(|_| sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, "Server error")))?;
    Ok(())
}

async fn hello_handler() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "message": "Hello from Rust!" }))
}