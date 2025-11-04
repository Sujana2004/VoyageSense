package com.travelplanner.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TravelPlannerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TravelPlannerBackendApplication.class, args);
	}

}
