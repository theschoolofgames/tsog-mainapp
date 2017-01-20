package EkStep;

/**
 * Created by Tony on 1/17/17.
 */

import org.ekstep.genieservices.sdks.response.GenieResponse;

public interface IRegister {

    public void onRegisterSuccess(GenieResponse genieResponse);
    public void onRegisterFailure(GenieResponse genieResponse);
}
