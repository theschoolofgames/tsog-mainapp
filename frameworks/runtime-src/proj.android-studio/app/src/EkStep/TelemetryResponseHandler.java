package EkStep;

/**
 * Created by Tony on 1/18/17.
 */

import org.ekstep.genieservices.sdks.response.GenieResponse;
import org.ekstep.genieservices.sdks.response.IResponseHandler;

public class TelemetryResponseHandler implements IResponseHandler {
    private ITelemetryData mtelemetryData = null;

    public TelemetryResponseHandler(ITelemetryData telemetryData) {
        mtelemetryData = telemetryData;
    }

    @Override
    public void onSuccess(GenieResponse response) {
        // Code to handle success scenario
        mtelemetryData.onSuccessTelemetry(response);


    }

    @Override
    public void onFailure(GenieResponse response) {
        // Code to handle error scenario
        mtelemetryData.onFailureTelemetry(response);

    }

}
