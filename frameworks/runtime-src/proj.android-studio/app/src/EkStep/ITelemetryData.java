package EkStep;

import org.ekstep.genieservices.sdks.response.GenieResponse;

/**
 * Created by Tony on 1/18/17.
 */
public interface ITelemetryData {

    public void onSuccessTelemetry(GenieResponse genieResponse);
    public void onFailureTelemetry(GenieResponse genieResponse);
}

